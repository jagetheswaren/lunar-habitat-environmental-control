package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.ConsumptionBillingRequest;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.enums.InvoiceStatus;
import com.lunar.habitat.enums.ProductType;
import com.lunar.habitat.enums.UnitOfMeasure;
import com.lunar.habitat.exception.InvalidStatusTransitionException;
import com.lunar.habitat.repository.*;
import com.lunar.habitat.service.impl.InvoiceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private HabitatZoneRepository habitatZoneRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SalesOrderRepository salesOrderRepository;

    @Mock
    private TelemetryRepository telemetryRepository;

    @Mock
    private AccountingEngineService accountingEngineService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private Contact miningFirm;
    private HabitatZone domeAlpha;
    private Product oxygenProduct;
    private Product waterProduct;

    @BeforeEach
    void setUp() {
        miningFirm = new Contact("CUST-001", "Selene Mining Corp", "Selene Mining Corp", ContactType.CUSTOMER, "billing@selene.luna");
        miningFirm.setId(10L);

        domeAlpha = new HabitatZone("DOME-A", "Habitat Dome Alpha", "Mining Base", "Sector 1");
        domeAlpha.setId(1L);

        oxygenProduct = new Product("OXY-RECLAIMED", "Reclaimed Oxygen", ProductType.GOODS, UnitOfMeasure.M3, new BigDecimal("12.50"));
        oxygenProduct.setId(20L);

        waterProduct = new Product("H2O-POTABLE", "Potable Water", ProductType.GOODS, UnitOfMeasure.LITER, new BigDecimal("0.80"));
        waterProduct.setId(21L);
    }

    @Test
    @DisplayName("Should generate consumption-based invoice from telemetry and product master prices")
    void testGenerateConsumptionInvoice() {
        LocalDate start = LocalDate.of(2026, 1, 1);
        LocalDate end = LocalDate.of(2026, 1, 31);

        when(contactRepository.findById(10L)).thenReturn(Optional.of(miningFirm));
        when(habitatZoneRepository.findById(1L)).thenReturn(Optional.of(domeAlpha));
        when(invoiceRepository.existsByCustomerAndBillingPeriod(10L, start, end)).thenReturn(false);

        // 500 m³ Oxygen and 2000 L Water consumed
        when(telemetryRepository.calculateTotalOxygenConsumption(eq(1L), any(), any()))
                .thenReturn(new BigDecimal("500.00"));
        when(telemetryRepository.calculateTotalWaterConsumption(eq(1L), any(), any()))
                .thenReturn(new BigDecimal("2000.00"));

        when(productRepository.findBySku(InvoiceServiceImpl.SKU_OXYGEN)).thenReturn(Optional.of(oxygenProduct));
        when(productRepository.findBySku(InvoiceServiceImpl.SKU_WATER)).thenReturn(Optional.of(waterProduct));

        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice inv = invocation.getArgument(0);
            inv.setId(100L);
            return inv;
        });

        ConsumptionBillingRequest req = new ConsumptionBillingRequest();
        req.setCustomerId(10L);
        req.setHabitatZoneId(1L);
        req.setBillingPeriodStart(start);
        req.setBillingPeriodEnd(end);
        req.setIncludeScrubberService(false);

        Invoice invoice = invoiceService.generateConsumptionInvoice(req);

        assertNotNull(invoice);
        // Calculation: 500 m³ * 12.50 = 6250.00; 2000 L * 0.80 = 1600.00; Total = 7850.00
        assertEquals(new BigDecimal("7850.0000"), invoice.getTotal());
        assertEquals(InvoiceStatus.DRAFT, invoice.getStatus());
        assertEquals(2, invoice.getLines().size());
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }

    @Test
    @DisplayName("Posting invoice transitions status from DRAFT to POSTED and creates ledger journal entry")
    void testPostInvoiceSuccess() {
        Invoice invoice = new Invoice();
        invoice.setId(200L);
        invoice.setInvoiceNumber("INV-2026-0099");
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setTotal(new BigDecimal("8100.00"));
        invoice.setInvoiceDate(LocalDate.now());

        when(invoiceRepository.findById(200L)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Invoice posted = invoiceService.postInvoice(200L);

        assertEquals(InvoiceStatus.POSTED, posted.getStatus());
        verify(accountingEngineService, times(1)).postCustomerInvoice(eq(invoice));
    }

    @Test
    @DisplayName("Posting already posted or paid invoice throws InvalidStatusTransitionException")
    void testPostAlreadyPostedInvoiceThrowsException() {
        Invoice invoice = new Invoice();
        invoice.setId(201L);
        invoice.setStatus(InvoiceStatus.PAID);

        when(invoiceRepository.findById(201L)).thenReturn(Optional.of(invoice));

        assertThrows(InvalidStatusTransitionException.class, () -> invoiceService.postInvoice(201L));
        verify(accountingEngineService, never()).postCustomerInvoice(any());
    }
}
