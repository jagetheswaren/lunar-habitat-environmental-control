package com.lunar.habitat.dto.response;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

public class BudgetReportResponse {

    private Integer fiscalYear;
    private String period;
    private List<BudgetLineItem> items = new ArrayList<>();
    private BigDecimal totalPlanned = BigDecimal.ZERO;
    private BigDecimal totalActual = BigDecimal.ZERO;
    private BigDecimal totalVariance = BigDecimal.ZERO;
    private BigDecimal overallVariancePercent = BigDecimal.ZERO;

    public BudgetReportResponse() {}

    public static class BudgetLineItem {
        private String accountCode;
        private String accountName;
        private String accountType;
        private String analyticAccountCode;
        private String analyticAccountName;
        private String period;
        private BigDecimal plannedAmount;
        private BigDecimal actualAmount;
        private BigDecimal variance;
        private BigDecimal variancePercent;

        public BudgetLineItem() {}

        public BudgetLineItem(String accountCode, String accountName, String accountType,
                              String analyticAccountCode, String analyticAccountName, String period,
                              BigDecimal plannedAmount, BigDecimal actualAmount) {
            this.accountCode = accountCode;
            this.accountName = accountName;
            this.accountType = accountType;
            this.analyticAccountCode = analyticAccountCode;
            this.analyticAccountName = analyticAccountName;
            this.period = period;
            this.plannedAmount = plannedAmount != null ? plannedAmount : BigDecimal.ZERO;
            this.actualAmount = actualAmount != null ? actualAmount : BigDecimal.ZERO;
            this.variance = this.actualAmount.subtract(this.plannedAmount);
            if (this.plannedAmount.compareTo(BigDecimal.ZERO) != 0) {
                this.variancePercent = this.variance.multiply(new BigDecimal("100"))
                        .divide(this.plannedAmount, 2, RoundingMode.HALF_UP);
            } else {
                this.variancePercent = BigDecimal.ZERO;
            }
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

        public String getAccountType() {
            return accountType;
        }

        public void setAccountType(String accountType) {
            this.accountType = accountType;
        }

        public String getAnalyticAccountCode() {
            return analyticAccountCode;
        }

        public void setAnalyticAccountCode(String analyticAccountCode) {
            this.analyticAccountCode = analyticAccountCode;
        }

        public String getAnalyticAccountName() {
            return analyticAccountName;
        }

        public void setAnalyticAccountName(String analyticAccountName) {
            this.analyticAccountName = analyticAccountName;
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

        public BigDecimal getActualAmount() {
            return actualAmount;
        }

        public void setActualAmount(BigDecimal actualAmount) {
            this.actualAmount = actualAmount;
        }

        public BigDecimal getVariance() {
            return variance;
        }

        public void setVariance(BigDecimal variance) {
            this.variance = variance;
        }

        public BigDecimal getVariancePercent() {
            return variancePercent;
        }

        public void setVariancePercent(BigDecimal variancePercent) {
            this.variancePercent = variancePercent;
        }
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

    public List<BudgetLineItem> getItems() {
        return items;
    }

    public void setItems(List<BudgetLineItem> items) {
        this.items = items;
    }

    public BigDecimal getTotalPlanned() {
        return totalPlanned;
    }

    public void setTotalPlanned(BigDecimal totalPlanned) {
        this.totalPlanned = totalPlanned;
    }

    public BigDecimal getTotalActual() {
        return totalActual;
    }

    public void setTotalActual(BigDecimal totalActual) {
        this.totalActual = totalActual;
    }

    public BigDecimal getTotalVariance() {
        return totalVariance;
    }

    public void setTotalVariance(BigDecimal totalVariance) {
        this.totalVariance = totalVariance;
    }

    public BigDecimal getOverallVariancePercent() {
        return overallVariancePercent;
    }

    public void setOverallVariancePercent(BigDecimal overallVariancePercent) {
        this.overallVariancePercent = overallVariancePercent;
    }
}
