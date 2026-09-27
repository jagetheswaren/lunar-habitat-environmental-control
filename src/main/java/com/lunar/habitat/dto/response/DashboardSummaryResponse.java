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

    // Real-time environmental metrics from latest telemetry
    private BigDecimal latestPressure;
    private BigDecimal latestCo2Level;
    private BigDecimal latestWaterPurity;
    private BigDecimal latestTemperature;
    private BigDecimal latestHumidity;

    // Real-time financial balances from double-entry ledger
    private BigDecimal cashBankBalance = BigDecimal.ZERO;
    private BigDecimal maintenanceExpenses = BigDecimal.ZERO;
    private BigDecimal lifeSupportRevenue = BigDecimal.ZERO;
    private BigDecimal budgetPlanned = BigDecimal.ZERO;
    private BigDecimal budgetActual = BigDecimal.ZERO;
    private BigDecimal budgetUtilization = BigDecimal.ZERO;

    // Historical points for Chart.js
    private java.util.List<TelemetryDataPoint> recentTelemetry = new java.util.ArrayList<>();

    public static class TelemetryDataPoint {
        private String timestamp;
        private Double pressure;
        private Double co2;
        private Double waterPurity;
        private Double oxygenConsumption;
        private Double waterConsumption;

        public TelemetryDataPoint() {}

        public TelemetryDataPoint(String timestamp, Double pressure, Double co2, Double waterPurity, Double oxygenConsumption, Double waterConsumption) {
            this.timestamp = timestamp;
            this.pressure = pressure;
            this.co2 = co2;
            this.waterPurity = waterPurity;
            this.oxygenConsumption = oxygenConsumption;
            this.waterConsumption = waterConsumption;
        }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public Double getPressure() { return pressure; }
        public void setPressure(Double pressure) { this.pressure = pressure; }
        public Double getCo2() { return co2; }
        public void setCo2(Double co2) { this.co2 = co2; }
        public Double getWaterPurity() { return waterPurity; }
        public void setWaterPurity(Double waterPurity) { this.waterPurity = waterPurity; }
        public Double getOxygenConsumption() { return oxygenConsumption; }
        public void setOxygenConsumption(Double oxygenConsumption) { this.oxygenConsumption = oxygenConsumption; }
        public Double getWaterConsumption() { return waterConsumption; }
        public void setWaterConsumption(Double waterConsumption) { this.waterConsumption = waterConsumption; }
    }

    public BigDecimal getLatestPressure() { return latestPressure; }
    public void setLatestPressure(BigDecimal latestPressure) { this.latestPressure = latestPressure; }

    public BigDecimal getLatestCo2Level() { return latestCo2Level; }
    public void setLatestCo2Level(BigDecimal latestCo2Level) { this.latestCo2Level = latestCo2Level; }

    public BigDecimal getLatestWaterPurity() { return latestWaterPurity; }
    public void setLatestWaterPurity(BigDecimal latestWaterPurity) { this.latestWaterPurity = latestWaterPurity; }

    public BigDecimal getLatestTemperature() { return latestTemperature; }
    public void setLatestTemperature(BigDecimal latestTemperature) { this.latestTemperature = latestTemperature; }

    public BigDecimal getLatestHumidity() { return latestHumidity; }
    public void setLatestHumidity(BigDecimal latestHumidity) { this.latestHumidity = latestHumidity; }

    public BigDecimal getCashBankBalance() { return cashBankBalance; }
    public void setCashBankBalance(BigDecimal cashBankBalance) { this.cashBankBalance = cashBankBalance; }

    public BigDecimal getMaintenanceExpenses() { return maintenanceExpenses; }
    public void setMaintenanceExpenses(BigDecimal maintenanceExpenses) { this.maintenanceExpenses = maintenanceExpenses; }

    public BigDecimal getLifeSupportRevenue() { return lifeSupportRevenue; }
    public void setLifeSupportRevenue(BigDecimal lifeSupportRevenue) { this.lifeSupportRevenue = lifeSupportRevenue; }

    public BigDecimal getBudgetPlanned() { return budgetPlanned; }
    public void setBudgetPlanned(BigDecimal budgetPlanned) { this.budgetPlanned = budgetPlanned; }

    public BigDecimal getBudgetActual() { return budgetActual; }
    public void setBudgetActual(BigDecimal budgetActual) { this.budgetActual = budgetActual; }

    public BigDecimal getBudgetUtilization() { return budgetUtilization; }
    public void setBudgetUtilization(BigDecimal budgetUtilization) { this.budgetUtilization = budgetUtilization; }

    public java.util.List<TelemetryDataPoint> getRecentTelemetry() { return recentTelemetry; }
    public void setRecentTelemetry(java.util.List<TelemetryDataPoint> recentTelemetry) { this.recentTelemetry = recentTelemetry; }

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
