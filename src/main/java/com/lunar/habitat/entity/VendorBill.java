package com.lunar.habitat.entity;

import com.lunar.habitat.enums.BillStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendor_bills")
public class VendorBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", nullable = false, unique = true, length = 50)
    private String billNumber;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Contact vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate = LocalDate.now();

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate = LocalDate.now().plusDays(30);

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
    private BillStatus status = BillStatus.DRAFT;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    private JournalEntry journalEntry;

    @Column(length = 500)
    private String notes;

    @OneToMany(mappedBy = "vendorBill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<VendorBillLine> lines = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public VendorBill() {}

    public void addLine(VendorBillLine line) {
        lines.add(line);
        line.setVendorBill(this);
    }

    public void removeLine(VendorBillLine line) {
        lines.remove(line);
        line.setVendorBill(null);
    }

    public void recalculateTotals() {
        BigDecimal calcSubtotal = BigDecimal.ZERO;
        BigDecimal calcTax = BigDecimal.ZERO;
        for (VendorBillLine line : lines) {
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

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public Contact getVendor() {
        return vendor;
    }

    public void setVendor(Contact vendor) {
        this.vendor = vendor;
    }

    public PurchaseOrder getPurchaseOrder() {
        return purchaseOrder;
    }

    public void setPurchaseOrder(PurchaseOrder purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
    }

    public LocalDate getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDate billDate) {
        this.billDate = billDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
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

    public BillStatus getStatus() {
        return status;
    }

    public void setStatus(BillStatus status) {
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

    public List<VendorBillLine> getLines() {
        return lines;
    }

    public void setLines(List<VendorBillLine> lines) {
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
