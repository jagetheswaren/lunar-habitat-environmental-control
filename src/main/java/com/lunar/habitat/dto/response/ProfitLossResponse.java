package com.lunar.habitat.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ProfitLossResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private List<IncomeExpenseItem> revenueItems = new ArrayList<>();
    private List<IncomeExpenseItem> expenseItems = new ArrayList<>();
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private BigDecimal totalExpenses = BigDecimal.ZERO;
    private BigDecimal netResult = BigDecimal.ZERO;

    public ProfitLossResponse() {}

    public static class IncomeExpenseItem {
        private String accountCode;
        private String accountName;
        private BigDecimal amount;

        public IncomeExpenseItem() {}

        public IncomeExpenseItem(String accountCode, String accountName, BigDecimal amount) {
            this.accountCode = accountCode;
            this.accountName = accountName;
            this.amount = amount != null ? amount : BigDecimal.ZERO;
        }

        public String getAccountCode() {
            return accountCode;
        }

        public void setAccountCode(String accountCode) {
            this.accountCode = accountCode;
        }

        public String getAccountName() {
            return accountName;
        }

        public void setAccountName(String accountName) {
            this.accountName = accountName;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<IncomeExpenseItem> getRevenueItems() {
        return revenueItems;
    }

    public void setRevenueItems(List<IncomeExpenseItem> revenueItems) {
        this.revenueItems = revenueItems;
    }

    public List<IncomeExpenseItem> getExpenseItems() {
        return expenseItems;
    }

    public void setExpenseItems(List<IncomeExpenseItem> expenseItems) {
        this.expenseItems = expenseItems;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getNetResult() {
        return netResult;
    }

    public void setNetResult(BigDecimal netResult) {
        this.netResult = netResult;
    }
}
