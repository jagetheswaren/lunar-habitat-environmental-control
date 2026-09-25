package com.lunar.habitat.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class LineItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @PositiveOrZero(message = "Unit price must be zero or positive")
    private BigDecimal unitPrice;

    @PositiveOrZero(message = "Tax rate must be zero or positive")
    private BigDecimal taxRate;

    public LineItemRequest() {}

    public LineItemRequest(Long productId, BigDecimal quantity, BigDecimal unitPrice, BigDecimal taxRate) {
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.taxRate = taxRate;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
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
}
