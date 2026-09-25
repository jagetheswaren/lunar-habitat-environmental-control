package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.VendorBillRequest;
import com.lunar.habitat.entity.VendorBill;
import com.lunar.habitat.enums.BillStatus;
import com.lunar.habitat.service.VendorBillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lunar/vendor-bills")
@Tag(name = "Vendor Bills", description = "Vendor Invoices and Accounts Payable API")
public class VendorBillApiController {

    private final VendorBillService vendorBillService;

    public VendorBillApiController(VendorBillService vendorBillService) {
        this.vendorBillService = vendorBillService;
    }

    @PostMapping
    @Operation(summary = "Create Vendor Bill", description = "Creates a draft bill received from a vendor")
    public ResponseEntity<VendorBill> createVendorBill(@Valid @RequestBody VendorBillRequest request) {
        VendorBill created = vendorBillService.createVendorBill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/from-po/{poId}")
    @Operation(summary = "Create Vendor Bill from PO", description = "Generates a draft bill directly from an approved purchase order")
    public ResponseEntity<VendorBill> createFromPo(@PathVariable Long poId) {
        VendorBill created = vendorBillService.createVendorBillFromPurchaseOrder(poId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Search Vendor Bills", description = "Retrieves paginated vendor bills with status and vendor filters")
    public ResponseEntity<Page<VendorBill>> searchVendorBills(
            @RequestParam(required = false) BillStatus status,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity.ok(vendorBillService.searchVendorBills(status, vendorId, query, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Vendor Bill by ID", description = "Retrieves vendor bill details and lines")
    public ResponseEntity<VendorBill> getVendorBillById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorBillService.getVendorBillById(id));
    }

    @PostMapping("/{id}/post")
    @Operation(summary = "Post Vendor Bill", description = "Posts bill to ledger, creating double-entry journal (DEBIT Expense, CREDIT Accounts Payable)")
    public ResponseEntity<VendorBill> postVendorBill(@PathVariable Long id) {
        return ResponseEntity.ok(vendorBillService.postVendorBill(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel Vendor Bill", description = "Cancels a draft vendor bill")
    public ResponseEntity<VendorBill> cancelVendorBill(@PathVariable Long id) {
        return ResponseEntity.ok(vendorBillService.cancelVendorBill(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Vendor Bill", description = "Deletes a draft vendor bill")
    public ResponseEntity<Void> deleteVendorBill(@PathVariable Long id) {
        vendorBillService.deleteVendorBill(id);
        return ResponseEntity.noContent().build();
    }
}
