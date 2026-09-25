package com.lunar.habitat.entity;

import com.lunar.habitat.enums.UnitOfMeasure;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_inventories")
public class ResourceInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resource_name", nullable = false, length = 100)
    private String resourceName;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_of_measure", nullable = false, length = 20)
    private UnitOfMeasure unitOfMeasure;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(name = "minimum_stock", nullable = false, precision = 19, scale = 4)
    private BigDecimal minimumStock = new BigDecimal("100.0000");

    @Column(name = "maximum_stock", nullable = false, precision = 19, scale = 4)
    private BigDecimal maximumStock = new BigDecimal("10000.0000");

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated = LocalDateTime.now();

    public ResourceInventory() {}

    public ResourceInventory(String resourceName, String sku, BigDecimal quantity, UnitOfMeasure unitOfMeasure, String location, BigDecimal minimumStock, BigDecimal maximumStock) {
        this.resourceName = resourceName;
        this.sku = sku;
        this.quantity = quantity;
        this.unitOfMeasure = unitOfMeasure;
        this.location = location;
        this.minimumStock = minimumStock;
        this.maximumStock = maximumStock;
        this.lastUpdated = LocalDateTime.now();
    }

    public boolean isLowStock() {
        return quantity != null && minimumStock != null && quantity.compareTo(minimumStock) < 0;
    }

    @PreUpdate
    public void onPreUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
