package com.lunar.habitat.entity;

import com.lunar.habitat.enums.InvoiceStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Contact customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id")
    private SalesOrder salesOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habitat_zone_id")
    private HabitatZone habitatZone;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate = LocalDate.now();

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate = LocalDate.now().plusDays(30);

    @Column(name = "billing_period_start")
    private LocalDate billingPeriodStart;

    @Column(name = "billing_period_end")
    private LocalDate billingPeriodEnd;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "paid_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    private JournalEntry journalEntry;

    @Column(length = 500)
    private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InvoiceLine> lines = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Invoice() {}

    public void addLine(InvoiceLine line) {
        lines.add(line);
        line.setInvoice(this);
    }

    public void removeLine(InvoiceLine line) {
        lines.remove(line);
        line.setInvoice(null);
    }

    public void recalculateTotals() {
        BigDecimal calcSubtotal = BigDecimal.ZERO;
        BigDecimal calcTax = BigDecimal.ZERO;
        for (InvoiceLine line : lines) {
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

    public BigDecimal getBalanceDue() {
        return total.subtract(paidAmount);
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

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Contact getCustomer() {
        return customer;
    }

    public void setCustomer(Contact customer) {
        this.customer = customer;
    }

    public SalesOrder getSalesOrder() {
        return salesOrder;
    }

    public void setSalesOrder(SalesOrder salesOrder) {
        this.salesOrder = salesOrder;
    }

    public HabitatZone getHabitatZone() {
        return habitatZone;
    }

    public void setHabitatZone(HabitatZone habitatZone) {
        this.habitatZone = habitatZone;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getBillingPeriodStart() {
        return billingPeriodStart;
    }

    public void setBillingPeriodStart(LocalDate billingPeriodStart) {
        this.billingPeriodStart = billingPeriodStart;
    }

    public LocalDate getBillingPeriodEnd() {
        return billingPeriodEnd;
    }

    public void setBillingPeriodEnd(LocalDate billingPeriodEnd) {
        this.billingPeriodEnd = billingPeriodEnd;
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

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public JournalEntry getJournalEntry() {
        return journalEntry;
    }

    public void setJournalEntry(JournalEntry journalEntry) {
        this.journalEntry = journalEntry;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<InvoiceLine> getLines() {
        return lines;
    }

    public void setLines(List<InvoiceLine> lines) {
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
