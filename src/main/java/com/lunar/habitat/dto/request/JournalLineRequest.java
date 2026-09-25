package com.lunar.habitat.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class JournalLineRequest {

    @NotNull(message = "Account ID is required")
    private Long accountId;

    private Long analyticAccountId;

    private String description;

    @PositiveOrZero(message = "Debit must be zero or positive")
    private BigDecimal debit = BigDecimal.ZERO;

    @PositiveOrZero(message = "Credit must be zero or positive")
    private BigDecimal credit = BigDecimal.ZERO;

    public JournalLineRequest() {}

    public JournalLineRequest(Long accountId, Long analyticAccountId, String description, BigDecimal debit, BigDecimal credit) {
        this.accountId = accountId;
        this.analyticAccountId = analyticAccountId;
        this.description = description;
        this.debit = debit != null ? debit : BigDecimal.ZERO;
        this.credit = credit != null ? credit : BigDecimal.ZERO;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public Long getAnalyticAccountId() {
        return analyticAccountId;
    }

    public void setAnalyticAccountId(Long analyticAccountId) {
        this.analyticAccountId = analyticAccountId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getDebit() {
        return debit;
    }

    public void setDebit(BigDecimal debit) {
        this.debit = debit;
    }

    public BigDecimal getCredit() {
        return credit;
    }

    public void setCredit(BigDecimal credit) {
        this.credit = credit;
    }
}
