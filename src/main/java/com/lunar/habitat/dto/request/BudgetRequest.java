package com.lunar.habitat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class BudgetRequest {

    @NotNull(message = "Analytic account ID is required")
    private Long analyticAccountId;

    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotNull(message = "Fiscal year is required")
    private Integer fiscalYear;

    @NotBlank(message = "Period is required (e.g., FY2026, Q1, M01)")
    private String period;

    @NotNull(message = "Planned amount is required")
    @PositiveOrZero(message = "Planned amount must be positive or zero")
    private BigDecimal plannedAmount;

    private String notes;

    public BudgetRequest() {}

    public Long getAnalyticAccountId() {
        return analyticAccountId;
    }

    public void setAnalyticAccountId(Long analyticAccountId) {
        this.analyticAccountId = analyticAccountId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
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
}
