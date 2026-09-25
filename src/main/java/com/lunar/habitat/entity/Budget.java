package com.lunar.habitat.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"analytic_account_id", "account_id", "fiscal_year", "period"})
})
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "analytic_account_id", nullable = false)
    private AnalyticAccount analyticAccount;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "fiscal_year", nullable = false)
    private Integer fiscalYear;

    @Column(nullable = false, length = 20)
    private String period;

    @Column(name = "planned_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal plannedAmount;

    @Column(length = 255)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Budget() {}

    public Budget(AnalyticAccount analyticAccount, Account account, Integer fiscalYear, String period, BigDecimal plannedAmount, String notes) {
        this.analyticAccount = analyticAccount;
        this.account = account;
        this.fiscalYear = fiscalYear;
        this.period = period;
        this.plannedAmount = plannedAmount;
        this.notes = notes;
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

    public AnalyticAccount getAnalyticAccount() {
        return analyticAccount;
    }

    public void setAnalyticAccount(AnalyticAccount analyticAccount) {
        this.analyticAccount = analyticAccount;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public Integer getFiscalYear() {
        return fiscalYear;
    }

    public void setFiscalYear(Integer fiscalYear) {
        this.fiscalYear = fiscalYear;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public BigDecimal getPlannedAmount() {
        return plannedAmount;
    }

    public void setPlannedAmount(BigDecimal plannedAmount) {
        this.plannedAmount = plannedAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
