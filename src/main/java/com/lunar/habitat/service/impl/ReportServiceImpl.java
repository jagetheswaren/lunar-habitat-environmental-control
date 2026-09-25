package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.response.*;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.*;
import com.lunar.habitat.repository.*;
import com.lunar.habitat.service.BudgetService;
import com.lunar.habitat.service.ReportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final AccountRepository accountRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;
    private final TelemetryRepository telemetryRepository;
    private final EnvironmentalAlertRepository environmentalAlertRepository;
    private final InvoiceRepository invoiceRepository;
    private final VendorBillRepository vendorBillRepository;
    private final ContactRepository contactRepository;
    private final HabitatZoneRepository habitatZoneRepository;
    private final ResourceInventoryRepository resourceInventoryRepository;
    private final BudgetService budgetService;

    public ReportServiceImpl(AccountRepository accountRepository,
                             JournalEntryLineRepository journalEntryLineRepository,
                             TelemetryRepository telemetryRepository,
                             EnvironmentalAlertRepository environmentalAlertRepository,
                             InvoiceRepository invoiceRepository,
                             VendorBillRepository vendorBillRepository,
                             ContactRepository contactRepository,
                             HabitatZoneRepository habitatZoneRepository,
                             ResourceInventoryRepository resourceInventoryRepository,
                             BudgetService budgetService) {
        this.accountRepository = accountRepository;
        this.journalEntryLineRepository = journalEntryLineRepository;
        this.telemetryRepository = telemetryRepository;
        this.environmentalAlertRepository = environmentalAlertRepository;
        this.invoiceRepository = invoiceRepository;
        this.vendorBillRepository = vendorBillRepository;
        this.contactRepository = contactRepository;
        this.habitatZoneRepository = habitatZoneRepository;
        this.resourceInventoryRepository = resourceInventoryRepository;
        this.budgetService = budgetService;
    }

    @Override
    public BalanceSheetResponse generateBalanceSheet(LocalDate asOfDate) {
        BalanceSheetResponse response = new BalanceSheetResponse();
        response.setAsOfDate(asOfDate != null ? asOfDate : LocalDate.now());

        List<Account> accounts = accountRepository.findByActiveTrue();
        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;
        BigDecimal totalEquity = BigDecimal.ZERO;

        for (Account account : accounts) {
            BigDecimal sumDebit = journalEntryLineRepository.sumDebitByAccountId(account.getId());
            BigDecimal sumCredit = journalEntryLineRepository.sumCreditByAccountId(account.getId());
            if (sumDebit == null) sumDebit = BigDecimal.ZERO;
            if (sumCredit == null) sumCredit = BigDecimal.ZERO;

            if (account.getAccountType() == AccountType.ASSET) {
                BigDecimal balance = sumDebit.subtract(sumCredit);
                response.getAssets().add(new BalanceSheetResponse.AccountBalanceItem(
                        account.getAccountCode(), account.getAccountName(), balance));
                totalAssets = totalAssets.add(balance);

            } else if (account.getAccountType() == AccountType.LIABILITY) {
                BigDecimal balance = sumCredit.subtract(sumDebit);
                response.getLiabilities().add(new BalanceSheetResponse.AccountBalanceItem(
                        account.getAccountCode(), account.getAccountName(), balance));
                totalLiabilities = totalLiabilities.add(balance);

            } else if (account.getAccountType() == AccountType.EQUITY) {
                BigDecimal balance = sumCredit.subtract(sumDebit);
                response.getEquity().add(new BalanceSheetResponse.AccountBalanceItem(
                        account.getAccountCode(), account.getAccountName(), balance));
                totalEquity = totalEquity.add(balance);
            }
        }

        // Add cumulative Net Result (Retained Earnings) into Equity
        BigDecimal totalCumulativeRevenue = journalEntryLineRepository.calculateTotalRevenue(null, response.getAsOfDate());
        BigDecimal totalCumulativeExpenses = journalEntryLineRepository.calculateTotalExpenses(null, response.getAsOfDate());
        BigDecimal retainedEarnings = totalCumulativeRevenue.subtract(totalCumulativeExpenses);

        response.getEquity().add(new BalanceSheetResponse.AccountBalanceItem(
                "3999", "Current Period Net Earnings", retainedEarnings));
        totalEquity = totalEquity.add(retainedEarnings);

        response.setTotalAssets(totalAssets);
        response.setTotalLiabilities(totalLiabilities);
        response.setTotalEquity(totalEquity);
        BigDecimal totalLiabilitiesAndEquity = totalLiabilities.add(totalEquity);
        response.setTotalLiabilitiesAndEquity(totalLiabilitiesAndEquity);
        response.setBalanced(totalAssets.compareTo(totalLiabilitiesAndEquity) == 0);

        return response;
    }

    @Override
    public ProfitLossResponse generateProfitAndLoss(LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().with(TemporalAdjusters.firstDayOfYear());
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        ProfitLossResponse response = new ProfitLossResponse();
        response.setStartDate(start);
        response.setEndDate(end);

        List<Account> accounts = accountRepository.findByActiveTrue();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (Account account : accounts) {
            BigDecimal sumDebit = journalEntryLineRepository.sumDebitByAccountId(account.getId());
            BigDecimal sumCredit = journalEntryLineRepository.sumCreditByAccountId(account.getId());
            if (sumDebit == null) sumDebit = BigDecimal.ZERO;
            if (sumCredit == null) sumCredit = BigDecimal.ZERO;

            if (account.getAccountType() == AccountType.INCOME) {
                BigDecimal netRevenue = sumCredit.subtract(sumDebit);
                response.getRevenueItems().add(new ProfitLossResponse.IncomeExpenseItem(
                        account.getAccountCode(), account.getAccountName(), netRevenue));
                totalRevenue = totalRevenue.add(netRevenue);

            } else if (account.getAccountType() == AccountType.EXPENSE) {
                BigDecimal netExpense = sumDebit.subtract(sumCredit);
                response.getExpenseItems().add(new ProfitLossResponse.IncomeExpenseItem(
                        account.getAccountCode(), account.getAccountName(), netExpense));
                totalExpenses = totalExpenses.add(netExpense);
            }
        }

        response.setTotalRevenue(totalRevenue);
        response.setTotalExpenses(totalExpenses);
        response.setNetResult(totalRevenue.subtract(totalExpenses));

        return response;
    }

    @Override
    public BudgetReportResponse generateBudgetReport(Integer fiscalYear, String period) {
        return budgetService.calculateBudgetVsActual(fiscalYear, period);
    }

    @Override
    public ResourceReportResponse generateResourceReport(LocalDate startDate, LocalDate endDate, Long zoneId) {
        LocalDateTime startDt = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime endDt = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        ResourceReportResponse response = new ResourceReportResponse();
        response.setPeriodStart(startDt);
        response.setPeriodEnd(endDt);

        BigDecimal totalOxygen = telemetryRepository.calculateTotalOxygenConsumption(zoneId, startDt, endDt);
        BigDecimal totalWater = telemetryRepository.calculateTotalWaterConsumption(zoneId, startDt, endDt);
        response.setTotalOxygenConsumedM3(totalOxygen);
        response.setTotalWaterConsumedLiters(totalWater);
        response.setTotalScrubberAdjustments(telemetryRepository.countByScrubberAutoAdjustedTrue());

        // Zone-wise Breakdown
        List<HabitatZone> zones = habitatZoneRepository.findAll();
        for (HabitatZone zone : zones) {
            BigDecimal zoneOxygen = telemetryRepository.calculateTotalOxygenConsumption(zone.getId(), startDt, endDt);
            BigDecimal zoneWater = telemetryRepository.calculateTotalWaterConsumption(zone.getId(), startDt, endDt);
            response.getZoneBreakdowns().add(new ResourceReportResponse.ZoneResourceConsumption(
                    zone.getCode(), zone.getName(), zoneOxygen, zoneWater));
        }

        // Current Inventory Stock Status
        List<ResourceInventory> inventories = resourceInventoryRepository.findAll();
        for (ResourceInventory inv : inventories) {
            boolean isLow = inv.getQuantity().compareTo(inv.getMinimumStock()) < 0;
            response.getInventoryStock().add(new ResourceReportResponse.StockLevelItem(
                    inv.getResourceName(),
                    inv.getSku(),
                    inv.getQuantity(),
                    inv.getUnitOfMeasure() != null ? inv.getUnitOfMeasure().name() : "UNIT",
                    inv.getLocation(),
                    isLow));
        }

        return response;
    }

    @Override
    public EnvironmentalReportResponse generateEnvironmentalReport(LocalDate startDate, LocalDate endDate, Long zoneId) {
        LocalDateTime since = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusDays(7);

        EnvironmentalReportResponse response = new EnvironmentalReportResponse();
        response.setSince(since);

        Double avgPressure = telemetryRepository.getAveragePressureSince(since);
        BigDecimal minPressure = telemetryRepository.getMinPressureSince(since);
        BigDecimal maxPressure = telemetryRepository.getMaxPressureSince(since);
        Double avgWaterPurity = telemetryRepository.getAverageWaterPuritySince(since);
        Double avgCo2 = telemetryRepository.getAverageCo2Since(since);

        response.setAveragePressureKpa(avgPressure != null ? avgPressure : 101.3);
        response.setMinPressureKpa(minPressure != null ? minPressure : new BigDecimal("101.3"));
        response.setMaxPressureKpa(maxPressure != null ? maxPressure : new BigDecimal("101.3"));
        response.setAverageWaterPurityPercent(avgWaterPurity != null ? avgWaterPurity : 99.0);
        response.setAverageCo2Ppm(avgCo2 != null ? avgCo2 : 400.0);

        long totalAlerts = environmentalAlertRepository.count();
        long criticalAlerts = environmentalAlertRepository.countByStatusAndSeverity(AlertStatus.OPEN, AlertSeverity.CRITICAL);
        long openAlerts = environmentalAlertRepository.countByStatus(AlertStatus.OPEN);

        response.setTotalAlerts(totalAlerts);
        response.setCriticalAlerts(criticalAlerts);
        response.setOpenAlerts(openAlerts);
        response.setScrubberAdjustments(telemetryRepository.countByScrubberAutoAdjustedTrue());

        if (criticalAlerts > 0) {
            response.setEnvironmentalHealthStatus("CRITICAL_ACTION_REQUIRED");
        } else if (openAlerts > 0) {
            response.setEnvironmentalHealthStatus("WARNING_ALERTS_ACTIVE");
        } else {
            response.setEnvironmentalHealthStatus("STABLE_OPTIMAL");
        }

        return response;
    }

    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        DashboardSummaryResponse summary = new DashboardSummaryResponse();

        summary.setTotalCustomers(contactRepository.countByContactType(ContactType.CUSTOMER));
        summary.setTotalVendors(contactRepository.countByContactType(ContactType.VENDOR));

        summary.setOpenAlerts(environmentalAlertRepository.countByStatus(AlertStatus.OPEN));
        summary.setCriticalAlerts(environmentalAlertRepository.countByStatusAndSeverity(AlertStatus.OPEN, AlertSeverity.CRITICAL));

        // 24h consumption
        LocalDateTime since24h = LocalDateTime.now().minusHours(24);
        LocalDateTime now = LocalDateTime.now();
        summary.setOxygenConsumption24h(telemetryRepository.calculateTotalOxygenConsumption(null, since24h, now));
        summary.setWaterConsumption24h(telemetryRepository.calculateTotalWaterConsumption(null, since24h, now));

        // Pending Vendor Bills
        summary.setPendingVendorBills(vendorBillRepository.countByStatus(BillStatus.POSTED) + vendorBillRepository.countByStatus(BillStatus.DRAFT));
        BigDecimal pendingBillsTotal = vendorBillRepository.findAll().stream()
                .filter(b -> b.getStatus() == BillStatus.POSTED || b.getStatus() == BillStatus.PARTIALLY_PAID)
                .map(b -> b.getBalanceDue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setPendingVendorBillsTotal(pendingBillsTotal);

        // Outstanding Customer Invoices
        summary.setOutstandingCustomerInvoices(invoiceRepository.countByStatus(InvoiceStatus.POSTED) + invoiceRepository.countByStatus(InvoiceStatus.PARTIALLY_PAID));
        BigDecimal outstandingInvoicesTotal = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() == InvoiceStatus.POSTED || i.getStatus() == InvoiceStatus.PARTIALLY_PAID)
                .map(i -> i.getBalanceDue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setOutstandingCustomerInvoicesTotal(outstandingInvoicesTotal);

        // Current Month Revenue and Expenses
        LocalDate startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());

        BigDecimal monthRevenue = journalEntryLineRepository.calculateTotalRevenue(startOfMonth, endOfMonth);
        BigDecimal monthExpenses = journalEntryLineRepository.calculateTotalExpenses(startOfMonth, endOfMonth);
        summary.setCurrentMonthRevenue(monthRevenue);
        summary.setCurrentMonthExpenses(monthExpenses);
        summary.setNetMonthlyIncome(monthRevenue.subtract(monthExpenses));

        // Budget variance
        BudgetReportResponse budgetReport = budgetService.calculateBudgetVsActual(LocalDate.now().getYear(), "ALL");
        summary.setBudgetVariance(budgetReport.getTotalVariance());

        if (summary.getCriticalAlerts() > 0) {
            summary.setSystemStatus("CRITICAL_ALERT");
        } else if (summary.getOpenAlerts() > 0) {
            summary.setSystemStatus("ELEVATED_WATCH");
        } else {
            summary.setSystemStatus("OPERATIONAL");
        }

        return summary;
    }
}
