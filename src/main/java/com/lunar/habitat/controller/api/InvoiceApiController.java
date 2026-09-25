package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.ConsumptionBillingRequest;
import com.lunar.habitat.dto.request.InvoiceRequest;
import com.lunar.habitat.entity.Invoice;
import com.lunar.habitat.enums.InvoiceStatus;
import com.lunar.habitat.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/lunar/invoices")
@Tag(name = "Customer Invoices", description = "Utility Billing, Sales Invoicing, and Accounts Receivable API")
public class InvoiceApiController {

    private final InvoiceService invoiceService;

    public InvoiceApiController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    @Operation(summary = "Create Manual Invoice", description = "Creates a draft invoice for customer goods and services")
    public ResponseEntity<Invoice> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        Invoice created = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/from-so/{soId}")
    @Operation(summary = "Create Invoice from Sales Order", description = "Generates an invoice directly from a confirmed sales order")
    public ResponseEntity<Invoice> createFromSalesOrder(@PathVariable Long soId) {
        Invoice created = invoiceService.createInvoiceFromSalesOrder(soId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/consumption-bill")
    @Operation(summary = "Automated Telemetry Consumption Billing",
            description = "Calculates actual Oxygen, Potable Water, and Scrubber usage from telemetry sensor readings in MySQL, multiplies by database master product prices, and generates a unified utility bill")
    public ResponseEntity<Invoice> generateConsumptionInvoice(@Valid @RequestBody ConsumptionBillingRequest request) {
        Invoice created = invoiceService.generateConsumptionInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Search Customer Invoices", description = "Retrieves paginated invoices with customer, status, and date range filters")
    public ResponseEntity<Page<Invoice>> searchInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity.ok(invoiceService.searchInvoices(status, customerId, startDate, endDate, query, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Invoice by ID", description = "Retrieves invoice details and itemized billing lines")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PostMapping("/{id}/post")
    @Operation(summary = "Post Invoice", description = "Posts invoice to General Ledger: DEBIT Accounts Receivable (1300), CREDIT Utility Revenue (4000). Total Debit == Total Credit verified.")
    public ResponseEntity<Invoice> postInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.postInvoice(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel Invoice", description = "Cancels a draft invoice")
    public ResponseEntity<Invoice> cancelInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.cancelInvoice(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Invoice", description = "Deletes a draft invoice")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
