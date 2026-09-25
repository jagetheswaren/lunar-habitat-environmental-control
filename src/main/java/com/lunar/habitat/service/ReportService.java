package com.lunar.habitat.service;

import com.lunar.habitat.dto.response.*;
import java.time.LocalDate;

public interface ReportService {
    BalanceSheetResponse generateBalanceSheet(LocalDate asOfDate);
    ProfitLossResponse generateProfitAndLoss(LocalDate startDate, LocalDate endDate);
    BudgetReportResponse generateBudgetReport(Integer fiscalYear, String period);
    ResourceReportResponse generateResourceReport(LocalDate startDate, LocalDate endDate, Long zoneId);
    EnvironmentalReportResponse generateEnvironmentalReport(LocalDate startDate, LocalDate endDate, Long zoneId);
    DashboardSummaryResponse getDashboardSummary();
}
