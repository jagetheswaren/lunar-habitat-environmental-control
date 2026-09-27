package com.lunar.habitat.dto.request;

import com.lunar.habitat.enums.UnitOfMeasure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class InventoryRequest {

    @NotBlank(message = "Resource name is required")
    @Size(max = 100, message = "Resource name must be at most 100 characters")
    private String resourceName;

    @NotBlank(message = "SKU is required")
    @Size(max = 50, message = "SKU must be at most 50 characters")
    private String sku;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity must be positive or zero")
    private BigDecimal quantity;

    @NotNull(message = "Unit of measure is required")
    private UnitOfMeasure unitOfMeasure;

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location must be at most 100 characters")
    private String location;

    @PositiveOrZero(message = "Minimum stock must be positive or zero")
    private BigDecimal minimumStock = new BigDecimal("100.0000");

    @PositiveOrZero(message = "Maximum stock must be positive or zero")
    private BigDecimal maximumStock = new BigDecimal("10000.0000");

    public InventoryRequest() {}

    public InventoryRequest(String resourceName, String sku, BigDecimal quantity, UnitOfMeasure unitOfMeasure, String location, BigDecimal minimumStock, BigDecimal maximumStock) {
        this.resourceName = resourceName;
        this.sku = sku;
        this.quantity = quantity;
        this.unitOfMeasure = unitOfMeasure;
        this.location = location;
        this.minimumStock = minimumStock;
        this.maximumStock = maximumStock;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public UnitOfMeasure getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(UnitOfMeasure unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public BigDecimal getMinimumStock() {
        return minimumStock;
    }

    public void setMinimumStock(BigDecimal minimumStock) {
        this.minimumStock = minimumStock;
    }

    public BigDecimal getMaximumStock() {
        return maximumStock;
    }

    public void setMaximumStock(BigDecimal maximumStock) {
        this.maximumStock = maximumStock;
    }
}
