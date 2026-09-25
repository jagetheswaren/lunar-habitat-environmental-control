package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.PurchaseOrderRequest;
import com.lunar.habitat.entity.PurchaseOrder;
import com.lunar.habitat.enums.PoStatus;
import com.lunar.habitat.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lunar/purchase-orders")
@Tag(name = "Purchase Orders", description = "Procurement and Purchase Order workflow management API")
public class PurchaseOrderApiController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderApiController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @PostMapping
    @Operation(summary = "Create Purchase Order", description = "Creates a draft purchase order for equipment, filters, or supplies")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrder created = purchaseOrderService.createPurchaseOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Search Purchase Orders", description = "Retrieves paginated purchase orders with status and vendor filters")
    public ResponseEntity<Page<PurchaseOrder>> searchPurchaseOrders(
            @RequestParam(required = false) PoStatus status,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity.ok(purchaseOrderService.searchPurchaseOrders(status, vendorId, query, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Purchase Order by ID", description = "Retrieves purchase order with line items")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Purchase Order", description = "Updates a draft purchase order before submission")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrder(@PathVariable Long id, @Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(purchaseOrderService.updatePurchaseOrder(id, request));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit Purchase Order", description = "Transitions status from DRAFT to SUBMITTED for management approval")
    public ResponseEntity<PurchaseOrder> submitPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.submitPurchaseOrder(id));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve Purchase Order", description = "Transitions status to APPROVED, enabling vendor bill creation")
    public ResponseEntity<PurchaseOrder> approvePurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.approvePurchaseOrder(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel Purchase Order", description = "Cancels a draft or submitted purchase order")
    public ResponseEntity<PurchaseOrder> cancelPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.cancelPurchaseOrder(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Purchase Order", description = "Deletes a draft purchase order")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }
}
