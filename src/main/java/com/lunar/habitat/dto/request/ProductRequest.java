package com.lunar.habitat.dto.request;

import com.lunar.habitat.enums.ProductType;
import com.lunar.habitat.enums.UnitOfMeasure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class ProductRequest {

    @NotBlank(message = "Product SKU is required")
    @Size(max = 50, message = "SKU must be at most 50 characters")
    private String sku;

    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Name must be at most 150 characters")
    private String name;

    private String description;

    @NotNull(message = "Product type (GOODS or SERVICE) is required")
    private ProductType productType;

    @NotNull(message = "Unit of measure is required")
    private UnitOfMeasure unitOfMeasure;

    @NotNull(message = "Unit price is required")
    @PositiveOrZero(message = "Unit price must be zero or positive")
    private BigDecimal unitPrice;

    @PositiveOrZero(message = "Tax rate must be zero or positive")
    private BigDecimal taxRate = BigDecimal.ZERO;

    private boolean active = true;

    public ProductRequest() {}

    public ProductRequest(String sku, String name, String description, ProductType productType, UnitOfMeasure unitOfMeasure, BigDecimal unitPrice, BigDecimal taxRate) {
        this.sku = sku;
        this.name = name;
        this.description = description;
        this.productType = productType;
        this.unitOfMeasure = unitOfMeasure;
        this.unitPrice = unitPrice;
        this.taxRate = taxRate;
        this.active = true;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProductType getProductType() {
        return productType;
    }

    public void setProductType(ProductType productType) {
        this.productType = productType;
    }

    public UnitOfMeasure getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(UnitOfMeasure unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
