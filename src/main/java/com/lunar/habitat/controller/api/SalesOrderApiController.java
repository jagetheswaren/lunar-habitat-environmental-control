package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.SalesOrderRequest;
import com.lunar.habitat.entity.SalesOrder;
import com.lunar.habitat.enums.SalesOrderStatus;
import com.lunar.habitat.service.SalesOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lunar/sales-orders")
@Tag(name = "Sales Orders", description = "Commercial Customer Contracts and Sales Orders API")
public class SalesOrderApiController {

    private final SalesOrderService salesOrderService;

    public SalesOrderApiController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    @PostMapping
    @Operation(summary = "Create Sales Order", description = "Creates a sales order contract for utility resources or lease services")
    public ResponseEntity<SalesOrder> createSalesOrder(@Valid @RequestBody SalesOrderRequest request) {
        SalesOrder created = salesOrderService.createSalesOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Search Sales Orders", description = "Retrieves paginated sales orders with customer and status filtering")
    public ResponseEntity<Page<SalesOrder>> searchSalesOrders(
            @RequestParam(required = false) SalesOrderStatus status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity.ok(salesOrderService.searchSalesOrders(status, customerId, query, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Sales Order by ID", description = "Retrieves sales order details and contracted lines")
    public ResponseEntity<SalesOrder> getSalesOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.getSalesOrderById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Sales Order", description = "Updates a draft sales order")
    public ResponseEntity<SalesOrder> updateSalesOrder(@PathVariable Long id, @Valid @RequestBody SalesOrderRequest request) {
        return ResponseEntity.ok(salesOrderService.updateSalesOrder(id, request));
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm Sales Order", description = "Transitions sales order from DRAFT to CONFIRMED")
    public ResponseEntity<SalesOrder> confirmSalesOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.confirmSalesOrder(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel Sales Order", description = "Cancels a sales order")
    public ResponseEntity<SalesOrder> cancelSalesOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.cancelSalesOrder(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Sales Order", description = "Deletes a draft sales order")
    public ResponseEntity<Void> deleteSalesOrder(@PathVariable Long id) {
        salesOrderService.deleteSalesOrder(id);
        return ResponseEntity.noContent().build();
    }
}
