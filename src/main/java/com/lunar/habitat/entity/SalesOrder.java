package com.lunar.habitat.entity;

import com.lunar.habitat.enums.SalesOrderStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_orders")
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Contact customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habitat_zone_id")
    private HabitatZone habitatZone;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate = LocalDate.now();

    @Column(name = "service_period_start")
    private LocalDate servicePeriodStart;

    @Column(name = "service_period_end")
    private LocalDate servicePeriodEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SalesOrderStatus status = SalesOrderStatus.DRAFT;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(length = 500)
    private String notes;

    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<SalesOrderLine> lines = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SalesOrder() {}

    public void addLine(SalesOrderLine line) {
        lines.add(line);
        line.setSalesOrder(this);
    }

    public void removeLine(SalesOrderLine line) {
        lines.remove(line);
        line.setSalesOrder(null);
    }

    public void recalculateTotals() {
        BigDecimal calcSubtotal = BigDecimal.ZERO;
        BigDecimal calcTax = BigDecimal.ZERO;
        for (SalesOrderLine line : lines) {
            BigDecimal lineBase = line.getUnitPrice().multiply(line.getQuantity());
            BigDecimal lineTax = lineBase.multiply(line.getTaxRate());
            line.setLineTotal(lineBase.add(lineTax));
            calcSubtotal = calcSubtotal.add(lineBase);
            calcTax = calcTax.add(lineTax);
        }
        this.subtotal = calcSubtotal;
        this.tax = calcTax;
        this.total = calcSubtotal.add(calcTax);
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Contact getCustomer() {
        return customer;
    }

    public void setCustomer(Contact customer) {
        this.customer = customer;
    }

    public HabitatZone getHabitatZone() {
        return habitatZone;
    }

    public void setHabitatZone(HabitatZone habitatZone) {
        this.habitatZone = habitatZone;
    }

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDate orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDate getServicePeriodStart() {
        return servicePeriodStart;
    }

    public void setServicePeriodStart(LocalDate servicePeriodStart) {
        this.servicePeriodStart = servicePeriodStart;
    }

    public LocalDate getServicePeriodEnd() {
        return servicePeriodEnd;
    }

    public void setServicePeriodEnd(LocalDate servicePeriodEnd) {
        this.servicePeriodEnd = servicePeriodEnd;
    }

    public SalesOrderStatus getStatus() {
        return status;
    }

    public void setStatus(SalesOrderStatus status) {
        this.status = status;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<SalesOrderLine> getLines() {
        return lines;
    }

    public void setLines(List<SalesOrderLine> lines) {
        this.lines = lines;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
