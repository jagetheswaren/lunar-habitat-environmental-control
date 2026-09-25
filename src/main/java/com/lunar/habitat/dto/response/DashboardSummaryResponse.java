package com.lunar.habitat.dto.response;

import java.math.BigDecimal;

public class DashboardSummaryResponse {

    private long totalCustomers;
    private long totalVendors;
    private long openAlerts;
    private long criticalAlerts;
    private BigDecimal oxygenConsumption24h = BigDecimal.ZERO;
    private BigDecimal waterConsumption24h = BigDecimal.ZERO;
    private long pendingVendorBills;
    private BigDecimal pendingVendorBillsTotal = BigDecimal.ZERO;
    private long outstandingCustomerInvoices;
    private BigDecimal outstandingCustomerInvoicesTotal = BigDecimal.ZERO;
    private BigDecimal currentMonthRevenue = BigDecimal.ZERO;
    private BigDecimal currentMonthExpenses = BigDecimal.ZERO;
    private BigDecimal netMonthlyIncome = BigDecimal.ZERO;
    private BigDecimal budgetVariance = BigDecimal.ZERO;
    private String systemStatus = "OPERATIONAL";

    public DashboardSummaryResponse() {}

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalVendors() {
        return totalVendors;
    }

    public void setTotalVendors(long totalVendors) {
        this.totalVendors = totalVendors;
    }

    public long getOpenAlerts() {
        return openAlerts;
    }

    public void setOpenAlerts(long openAlerts) {
        this.openAlerts = openAlerts;
    }

    public long getCriticalAlerts() {
        return criticalAlerts;
    }

    public void setCriticalAlerts(long criticalAlerts) {
        this.criticalAlerts = criticalAlerts;
    }

    public BigDecimal getOxygenConsumption24h() {
        return oxygenConsumption24h;
    }

    public void setOxygenConsumption24h(BigDecimal oxygenConsumption24h) {
        this.oxygenConsumption24h = oxygenConsumption24h;
    }

    public BigDecimal getWaterConsumption24h() {
        return waterConsumption24h;
    }

    public void setWaterConsumption24h(BigDecimal waterConsumption24h) {
        this.waterConsumption24h = waterConsumption24h;
    }

    public long getPendingVendorBills() {
        return pendingVendorBills;
    }

    public void setPendingVendorBills(long pendingVendorBills) {
        this.pendingVendorBills = pendingVendorBills;
    }

    public BigDecimal getPendingVendorBillsTotal() {
        return pendingVendorBillsTotal;
    }

    public void setPendingVendorBillsTotal(BigDecimal pendingVendorBillsTotal) {
        this.pendingVendorBillsTotal = pendingVendorBillsTotal;
    }

    public long getOutstandingCustomerInvoices() {
        return outstandingCustomerInvoices;
    }

    public void setOutstandingCustomerInvoices(long outstandingCustomerInvoices) {
        this.outstandingCustomerInvoices = outstandingCustomerInvoices;
    }

    public BigDecimal getOutstandingCustomerInvoicesTotal() {
        return outstandingCustomerInvoicesTotal;
    }

    public void setOutstandingCustomerInvoicesTotal(BigDecimal outstandingCustomerInvoicesTotal) {
        this.outstandingCustomerInvoicesTotal = outstandingCustomerInvoicesTotal;
    }

    public BigDecimal getCurrentMonthRevenue() {
        return currentMonthRevenue;
    }

    public void setCurrentMonthRevenue(BigDecimal currentMonthRevenue) {
        this.currentMonthRevenue = currentMonthRevenue;
    }

    public BigDecimal getCurrentMonthExpenses() {
        return currentMonthExpenses;
    }

    public void setCurrentMonthExpenses(BigDecimal currentMonthExpenses) {
        this.currentMonthExpenses = currentMonthExpenses;
    }

    public BigDecimal getNetMonthlyIncome() {
        return netMonthlyIncome;
    }

    public void setNetMonthlyIncome(BigDecimal netMonthlyIncome) {
        this.netMonthlyIncome = netMonthlyIncome;
    }

    public BigDecimal getBudgetVariance() {
        return budgetVariance;
    }

    public void setBudgetVariance(BigDecimal budgetVariance) {
        this.budgetVariance = budgetVariance;
    }

    public String getSystemStatus() {
        return systemStatus;
    }

    public void setSystemStatus(String systemStatus) {
        this.systemStatus = systemStatus;
    }
}
