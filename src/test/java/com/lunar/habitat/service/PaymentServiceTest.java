package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.PaymentRequest;
import com.lunar.habitat.entity.Contact;
import com.lunar.habitat.entity.Invoice;
import com.lunar.habitat.entity.Payment;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.enums.InvoiceStatus;
import com.lunar.habitat.enums.PaymentMethod;
import com.lunar.habitat.enums.PaymentStatus;
import com.lunar.habitat.exception.InsufficientPaymentException;
import com.lunar.habitat.repository.ContactRepository;
import com.lunar.habitat.repository.InvoiceRepository;
import com.lunar.habitat.repository.PaymentRepository;
import com.lunar.habitat.repository.VendorBillRepository;
import com.lunar.habitat.service.impl.PaymentServiceImpl;
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
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private VendorBillRepository vendorBillRepository;

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private AccountingEngineService accountingEngineService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Contact customer;
    private Invoice invoice;

    @BeforeEach
    void setUp() {
        customer = new Contact("CUST-001", "Selene Mining Corp", "Selene Corp", ContactType.CUSTOMER, "accounts@selene.luna");
        customer.setId(5L);

        invoice = new Invoice();
        invoice.setId(10L);
        invoice.setInvoiceNumber("INV-2026-0001");
        invoice.setCustomer(customer);
        invoice.setStatus(InvoiceStatus.POSTED);
        invoice.setTotal(new BigDecimal("10000.00"));
        invoice.setPaidAmount(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Partial payment transitions invoice status to PARTIALLY_PAID and updates paid amount")
    void testRecordPartialPaymentSuccess() {
        when(contactRepository.findById(5L)).thenReturn(Optional.of(customer));
        when(invoiceRepository.findById(10L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(50L);
            return p;
        });

        PaymentRequest request = new PaymentRequest();
        request.setContactId(5L);
        request.setInvoiceId(10L);
        request.setAmount(new BigDecimal("4000.00"));
        request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        request.setPaymentDate(LocalDate.now());

        Payment payment = paymentService.recordPayment(request);

        assertNotNull(payment);
        assertEquals(InvoiceStatus.PARTIALLY_PAID, invoice.getStatus());
        assertEquals(new BigDecimal("4000.00"), invoice.getPaidAmount());
        assertEquals(new BigDecimal("6000.00"), invoice.getBalanceDue());
        verify(accountingEngineService, times(1)).postCustomerPayment(any(Payment.class));
    }

    @Test
    @DisplayName("Full payment transitions invoice status to PAID")
    void testRecordFullPaymentSuccess() {
        when(contactRepository.findById(5L)).thenReturn(Optional.of(customer));
        when(invoiceRepository.findById(10L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentRequest request = new PaymentRequest();
        request.setContactId(5L);
        request.setInvoiceId(10L);
        request.setAmount(new BigDecimal("10000.00"));
        request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        request.setPaymentDate(LocalDate.now());

        Payment payment = paymentService.recordPayment(request);

        assertNotNull(payment);
        assertEquals(InvoiceStatus.PAID, invoice.getStatus());
        assertEquals(new BigDecimal("10000.00"), invoice.getPaidAmount());
        assertEquals(new BigDecimal("0.00"), invoice.getBalanceDue());
    }

    @Test
    @DisplayName("Payment exceeding outstanding balance throws InsufficientPaymentException")
    void testRecordPaymentExceedingBalanceThrowsException() {
        when(contactRepository.findById(5L)).thenReturn(Optional.of(customer));
        when(invoiceRepository.findById(10L)).thenReturn(Optional.of(invoice));

        PaymentRequest request = new PaymentRequest();
        request.setContactId(5L);
        request.setInvoiceId(10L);
        request.setAmount(new BigDecimal("12000.00")); // Exceeds 10,000.00
        request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);

        assertThrows(InsufficientPaymentException.class, () -> paymentService.recordPayment(request));
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(accountingEngineService, never()).postCustomerPayment(any());
    }
}
