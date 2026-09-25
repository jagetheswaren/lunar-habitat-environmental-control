package com.lunar.habitat.controller.api;

import com.lunar.habitat.entity.ResourceInventory;
import com.lunar.habitat.service.ResourceInventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/lunar/inventory")
@Tag(name = "Resource Inventory", description = "Stock Tracking and Low-Stock Alerting for Lunar Consumables and Equipment")
public class InventoryApiController {

    private final ResourceInventoryService resourceInventoryService;

    public InventoryApiController(ResourceInventoryService resourceInventoryService) {
        this.resourceInventoryService = resourceInventoryService;
    }

    @GetMapping
    @Operation(summary = "List Inventory Items", description = "Retrieves all tracked consumables (Oxygen, Water, CO2 Filters, etc.) and current stock levels")
    public ResponseEntity<List<ResourceInventory>> getAllInventory() {
        return ResponseEntity.ok(resourceInventoryService.getAllInventory());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Inventory Item by ID", description = "Retrieves stock details for a specific inventory resource")
    public ResponseEntity<ResourceInventory> getInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceInventoryService.getInventoryById(id));
    }

    @PutMapping("/{id}/stock")
    @Operation(summary = "Update Stock Quantity", description = "Updates inventory quantity and evaluates threshold for low-stock warning alerts")
    public ResponseEntity<ResourceInventory> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> request) {
        BigDecimal newQuantity = request.get("quantity");
        if (newQuantity == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(resourceInventoryService.updateStock(id, newQuantity));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get Low Stock Items", description = "Lists all resources currently below their defined safety buffer threshold")
    public ResponseEntity<List<ResourceInventory>> getLowStockResources() {
        return ResponseEntity.ok(resourceInventoryService.getLowStockResources());
    }
}
