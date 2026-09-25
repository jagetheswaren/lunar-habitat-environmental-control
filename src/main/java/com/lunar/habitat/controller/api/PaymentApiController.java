package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.PaymentRequest;
import com.lunar.habitat.entity.Payment;
import com.lunar.habitat.service.PaymentService;
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
import java.util.List;

@RestController
@RequestMapping("/api/v1/lunar/payments")
@Tag(name = "Payments", description = "Cash & Bank Payment Processing for Customer Invoices and Vendor Bills")
public class PaymentApiController {

    private final PaymentService paymentService;

    public PaymentApiController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @Operation(summary = "Record Payment",
            description = "Applies payment to customer invoice or vendor bill, updates status (PAID / PARTIALLY_PAID), prevents overpayment, and creates double-entry journal entry in Cash/Bank")
    public ResponseEntity<Payment> recordPayment(@Valid @RequestBody PaymentRequest request) {
        Payment created = paymentService.recordPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Search Payments", description = "Retrieves paginated payments with contact and date range filtering")
    public ResponseEntity<Page<Payment>> searchPayments(
            @RequestParam(required = false) Long contactId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity.ok(paymentService.searchPayments(contactId, startDate, endDate, query, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Payment by ID", description = "Retrieves payment record by ID")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/invoice/{invoiceId}")
    @Operation(summary = "Get Payments for Invoice", description = "Retrieves all payment transactions applied to a customer invoice")
    public ResponseEntity<List<Payment>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoiceId(invoiceId));
    }

    @GetMapping("/vendor-bill/{vendorBillId}")
    @Operation(summary = "Get Payments for Vendor Bill", description = "Retrieves all disbursement transactions applied to a vendor bill")
    public ResponseEntity<List<Payment>> getPaymentsByVendorBill(@PathVariable Long vendorBillId) {
        return ResponseEntity.ok(paymentService.getPaymentsByVendorBillId(vendorBillId));
    }
}
