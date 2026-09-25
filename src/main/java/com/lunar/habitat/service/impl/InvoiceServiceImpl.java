package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.ConsumptionBillingRequest;
import com.lunar.habitat.dto.request.InvoiceLineItemRequest;
import com.lunar.habitat.dto.request.InvoiceRequest;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.enums.InvoiceStatus;
import com.lunar.habitat.enums.SalesOrderStatus;
import com.lunar.habitat.exception.DuplicateResourceException;
import com.lunar.habitat.exception.InvalidStatusTransitionException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.exception.ValidationException;
import com.lunar.habitat.repository.*;
import com.lunar.habitat.service.AccountingEngineService;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.InvoiceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    public static final String SKU_OXYGEN = "OXY-RECLAIMED";
    public static final String SKU_WATER = "H2O-POTABLE";
    public static final String SKU_SCRUBBER = "SRV-SCRUBBER";

    private final InvoiceRepository invoiceRepository;
    private final ContactRepository contactRepository;
    private final HabitatZoneRepository habitatZoneRepository;
    private final ProductRepository productRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final TelemetryRepository telemetryRepository;
    private final AccountingEngineService accountingEngineService;
    private final AuditLogService auditLogService;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository,
                              ContactRepository contactRepository,
                              HabitatZoneRepository habitatZoneRepository,
                              ProductRepository productRepository,
                              SalesOrderRepository salesOrderRepository,
                              TelemetryRepository telemetryRepository,
                              AccountingEngineService accountingEngineService,
                              AuditLogService auditLogService) {
        this.invoiceRepository = invoiceRepository;
        this.contactRepository = contactRepository;
        this.habitatZoneRepository = habitatZoneRepository;
        this.productRepository = productRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.telemetryRepository = telemetryRepository;
        this.accountingEngineService = accountingEngineService;
        this.auditLogService = auditLogService;
    }

    @Override
    public Invoice createInvoice(InvoiceRequest request) {
        Contact customer = contactRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        if (customer.getContactType() != ContactType.CUSTOMER) {
            throw new ValidationException("Selected contact is not a Customer");
        }

        // Prevent duplicate invoices for the same customer and billing period if periods are specified
        if (request.getBillingPeriodStart() != null && request.getBillingPeriodEnd() != null) {
            if (invoiceRepository.existsByCustomerAndBillingPeriod(customer.getId(), request.getBillingPeriodStart(), request.getBillingPeriodEnd())) {
                throw new DuplicateResourceException(String.format(
                        "An active invoice already exists for customer '%s' for period %s to %s",
                        customer.getName(), request.getBillingPeriodStart(), request.getBillingPeriodEnd()));
            }
        }

        HabitatZone zone = null;
        if (request.getHabitatZoneId() != null) {
            zone = habitatZoneRepository.findById(request.getHabitatZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Habitat Zone not found with ID: " + request.getHabitatZoneId()));
        }

        SalesOrder so = null;
        if (request.getSalesOrderId() != null) {
            so = salesOrderRepository.findById(request.getSalesOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sales Order not found with ID: " + request.getSalesOrderId()));
        }

        Invoice invoice = new Invoice();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        invoice.setInvoiceNumber("INV-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        invoice.setCustomer(customer);
        invoice.setSalesOrder(so);
        invoice.setHabitatZone(zone);
        invoice.setInvoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now());
        invoice.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(30));
        invoice.setBillingPeriodStart(request.getBillingPeriodStart());
        invoice.setBillingPeriodEnd(request.getBillingPeriodEnd());
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setNotes(request.getNotes());

        for (InvoiceLineItemRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + lineReq.getProductId()));

            InvoiceLine line = new InvoiceLine(product, lineReq.getDescription(), lineReq.getQuantity(), lineReq.getUnitPrice(), lineReq.getTaxRate());
            invoice.addLine(line);
        }

        invoice.recalculateTotals();
        Invoice saved = invoiceRepository.save(invoice);

        auditLogService.logAction(AuditAction.CREATE, "INVOICE", saved.getId(), null, saved.getInvoiceNumber());
        return saved;
    }

    @Override
    public Invoice createInvoiceFromSalesOrder(Long salesOrderId) {
        SalesOrder so = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order not found with ID: " + salesOrderId));

        if (so.getStatus() != SalesOrderStatus.CONFIRMED) {
            throw new InvalidStatusTransitionException("Cannot invoice Sales Order in " + so.getStatus() + " status. Sales Order must be CONFIRMED.");
        }

        Invoice invoice = new Invoice();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        invoice.setInvoiceNumber("INV-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        invoice.setCustomer(so.getCustomer());
        invoice.setSalesOrder(so);
        invoice.setHabitatZone(so.getHabitatZone());
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setBillingPeriodStart(so.getServicePeriodStart());
        invoice.setBillingPeriodEnd(so.getServicePeriodEnd());
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setNotes("Generated from " + so.getOrderNumber());

        for (SalesOrderLine soLine : so.getLines()) {
            InvoiceLine invLine = new InvoiceLine(soLine.getProduct(), soLine.getProduct().getName(), soLine.getQuantity(), soLine.getUnitPrice(), soLine.getTaxRate());
            invoice.addLine(invLine);
        }

        invoice.recalculateTotals();
        Invoice saved = invoiceRepository.save(invoice);

        so.setStatus(SalesOrderStatus.INVOICED);
        salesOrderRepository.save(so);

        auditLogService.logAction(AuditAction.CREATE, "INVOICE", saved.getId(), so.getOrderNumber(), saved.getInvoiceNumber());
        return saved;
    }

    @Override
    public Invoice generateConsumptionInvoice(ConsumptionBillingRequest request) {
        Contact customer = contactRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        if (customer.getContactType() != ContactType.CUSTOMER) {
            throw new ValidationException("Selected contact is not a Customer");
        }

        HabitatZone zone = habitatZoneRepository.findById(request.getHabitatZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitat Zone not found with ID: " + request.getHabitatZoneId()));

        // Prevent duplicate invoices for the same customer and billing period
        if (invoiceRepository.existsByCustomerAndBillingPeriod(customer.getId(), request.getBillingPeriodStart(), request.getBillingPeriodEnd())) {
            throw new DuplicateResourceException(String.format(
                    "An active invoice already exists for customer '%s' for period %s to %s",
                    customer.getName(), request.getBillingPeriodStart(), request.getBillingPeriodEnd()));
        }

        LocalDateTime startDt = request.getBillingPeriodStart().atStartOfDay();
        LocalDateTime endDt = request.getBillingPeriodEnd().atTime(LocalTime.MAX);

        // Retrieve actual resource usage from telemetry
        BigDecimal totalOxygen = telemetryRepository.calculateTotalOxygenConsumption(zone.getId(), startDt, endDt);
        BigDecimal totalWater = telemetryRepository.calculateTotalWaterConsumption(zone.getId(), startDt, endDt);

        // Fetch master products from DB to get unit prices and tax rates (Never hardcoded)
        Product oxygenProduct = productRepository.findBySku(SKU_OXYGEN)
                .orElseThrow(() -> new ResourceNotFoundException("Master product not found with SKU: " + SKU_OXYGEN));

        Product waterProduct = productRepository.findBySku(SKU_WATER)
                .orElseThrow(() -> new ResourceNotFoundException("Master product not found with SKU: " + SKU_WATER));

        Invoice invoice = new Invoice();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        invoice.setInvoiceNumber("INV-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        invoice.setCustomer(customer);
        invoice.setHabitatZone(zone);
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setBillingPeriodStart(request.getBillingPeriodStart());
        invoice.setBillingPeriodEnd(request.getBillingPeriodEnd());
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setNotes("Telemetry-based automated utility bill for " + zone.getName() + " (" +
                request.getBillingPeriodStart() + " to " + request.getBillingPeriodEnd() + "). " +
                (request.getNotes() != null ? request.getNotes() : ""));

        // Oxygen Line
        if (totalOxygen.compareTo(BigDecimal.ZERO) > 0) {
            InvoiceLine oxygenLine = new InvoiceLine(
                    oxygenProduct,
                    String.format("Reclaimed Oxygen consumption: %.2f m³ @ %.2f/m³", totalOxygen, oxygenProduct.getUnitPrice()),
                    totalOxygen,
                    oxygenProduct.getUnitPrice(),
                    oxygenProduct.getTaxRate());
            invoice.addLine(oxygenLine);
        }

        // Water Line
        if (totalWater.compareTo(BigDecimal.ZERO) > 0) {
            InvoiceLine waterLine = new InvoiceLine(
                    waterProduct,
                    String.format("Potable Water consumption: %.2f L @ %.2f/L", totalWater, waterProduct.getUnitPrice()),
                    totalWater,
                    waterProduct.getUnitPrice(),
                    waterProduct.getTaxRate());
            invoice.addLine(waterLine);
        }

        // Optional Scrubber Servicing Fee
        if (request.isIncludeScrubberService()) {
            productRepository.findBySku(SKU_SCRUBBER).ifPresent(scrubberProduct -> {
                InvoiceLine scrubberLine = new InvoiceLine(
                        scrubberProduct,
                        "CO2 Scrubber Maintenance & Environmental Monitoring service charge",
                        BigDecimal.ONE,
                        scrubberProduct.getUnitPrice(),
                        scrubberProduct.getTaxRate());
                invoice.addLine(scrubberLine);
            });
        }

        // Ensure at least one line exists even if zero consumption was recorded
        if (invoice.getLines().isEmpty()) {
            invoice.addLine(new InvoiceLine(oxygenProduct, "Life-Support Base Service", BigDecimal.ONE, oxygenProduct.getUnitPrice(), oxygenProduct.getTaxRate()));
        }

        invoice.recalculateTotals();
        Invoice saved = invoiceRepository.save(invoice);

        auditLogService.logAction(AuditAction.CREATE, "INVOICE", saved.getId(), null,
                "Generated consumption invoice " + saved.getInvoiceNumber() + " for zone " + zone.getCode());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Invoice> searchInvoices(InvoiceStatus status, Long customerId, LocalDate startDate, LocalDate endDate, String query, Pageable pageable) {
        return invoiceRepository.searchInvoices(status, customerId, startDate, endDate, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @Override
    public Invoice postInvoice(Long id) {
        Invoice invoice = getInvoiceById(id);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Cannot post Invoice in " + invoice.getStatus() + " status. Only DRAFT invoices can be posted.");
        }

        // Post double-entry accounting entry:
        // DEBIT: 1300 Accounts Receivable
        // CREDIT: 4000 Life-Support Utility Revenue
        JournalEntry journalEntry = accountingEngineService.postCustomerInvoice(invoice);
        invoice.setJournalEntry(journalEntry);
        invoice.setStatus(InvoiceStatus.POSTED);

        Invoice saved = invoiceRepository.save(invoice);
        auditLogService.logAction(AuditAction.POST, "INVOICE", saved.getId(), "DRAFT", "POSTED");
        return saved;
    }

    @Override
    public Invoice cancelInvoice(Long id) {
        Invoice invoice = getInvoiceById(id);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Cannot cancel posted or paid invoice directly. A credit memo or reversal entry is required.");
        }
        invoice.setStatus(InvoiceStatus.CANCELLED);
        Invoice saved = invoiceRepository.save(invoice);
        auditLogService.logAction(AuditAction.CANCEL, "INVOICE", saved.getId(), "DRAFT", "CANCELLED");
        return saved;
    }

    @Override
    public void deleteInvoice(Long id) {
        Invoice invoice = getInvoiceById(id);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Only DRAFT invoices can be deleted.");
        }
        invoiceRepository.delete(invoice);
        auditLogService.logAction(AuditAction.DELETE, "INVOICE", id, invoice.getInvoiceNumber(), "DELETED");
    }
}
