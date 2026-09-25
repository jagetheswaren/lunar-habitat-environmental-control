package com.lunar.habitat.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BalanceSheetResponse {

    private LocalDate asOfDate;
    private List<AccountBalanceItem> assets = new ArrayList<>();
    private List<AccountBalanceItem> liabilities = new ArrayList<>();
    private List<AccountBalanceItem> equity = new ArrayList<>();
    private BigDecimal totalAssets = BigDecimal.ZERO;
    private BigDecimal totalLiabilities = BigDecimal.ZERO;
    private BigDecimal totalEquity = BigDecimal.ZERO;
    private BigDecimal totalLiabilitiesAndEquity = BigDecimal.ZERO;
    private boolean balanced = true;

    public BalanceSheetResponse() {
        this.asOfDate = LocalDate.now();
    }

    public static class AccountBalanceItem {
        private String accountCode;
        private String accountName;
        private BigDecimal balance;

        public AccountBalanceItem() {}

        public AccountBalanceItem(String accountCode, String accountName, BigDecimal balance) {
            this.accountCode = accountCode;
            this.accountName = accountName;
            this.balance = balance != null ? balance : BigDecimal.ZERO;
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

        public BigDecimal getBalance() {
            return balance;
        }

        public void setBalance(BigDecimal balance) {
            this.balance = balance;
        }
    }

    public LocalDate getAsOfDate() {
        return asOfDate;
    }

    public void setAsOfDate(LocalDate asOfDate) {
        this.asOfDate = asOfDate;
    }

    public List<AccountBalanceItem> getAssets() {
        return assets;
    }

    public void setAssets(List<AccountBalanceItem> assets) {
        this.assets = assets;
    }

    public List<AccountBalanceItem> getLiabilities() {
        return liabilities;
    }

    public void setLiabilities(List<AccountBalanceItem> liabilities) {
        this.liabilities = liabilities;
    }

    public List<AccountBalanceItem> getEquity() {
        return equity;
    }

    public void setEquity(List<AccountBalanceItem> equity) {
        this.equity = equity;
    }

    public BigDecimal getTotalAssets() {
        return totalAssets;
    }

    public void setTotalAssets(BigDecimal totalAssets) {
        this.totalAssets = totalAssets;
    }

    public BigDecimal getTotalLiabilities() {
        return totalLiabilities;
    }

    public void setTotalLiabilities(BigDecimal totalLiabilities) {
        this.totalLiabilities = totalLiabilities;
    }

    public BigDecimal getTotalEquity() {
        return totalEquity;
    }

    public void setTotalEquity(BigDecimal totalEquity) {
        this.totalEquity = totalEquity;
    }

    public BigDecimal getTotalLiabilitiesAndEquity() {
        return totalLiabilitiesAndEquity;
    }

    public void setTotalLiabilitiesAndEquity(BigDecimal totalLiabilitiesAndEquity) {
        this.totalLiabilitiesAndEquity = totalLiabilitiesAndEquity;
    }

    public boolean isBalanced() {
        return balanced;
    }

    public void setBalanced(boolean balanced) {
        this.balanced = balanced;
    }
}
