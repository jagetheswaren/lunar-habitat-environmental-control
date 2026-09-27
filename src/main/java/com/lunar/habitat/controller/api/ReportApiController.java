package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.response.*;
import com.lunar.habitat.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping({"/api/v1/lunar/reports", "/api/v2/reports"})
@Tag(name = "Reports & Analytics", description = "Financial, Resource, Environmental, and Operational Reports API")
public class ReportApiController {

    private final ReportService reportService;
    private final com.lunar.habitat.service.InvoiceService invoiceService;
    private final com.lunar.habitat.service.VendorBillService vendorBillService;
    private final com.lunar.habitat.service.AccountingEngineService accountingEngineService;

    public ReportApiController(ReportService reportService,
                               com.lunar.habitat.service.InvoiceService invoiceService,
                               com.lunar.habitat.service.VendorBillService vendorBillService,
                               com.lunar.habitat.service.AccountingEngineService accountingEngineService) {
        this.reportService = reportService;
        this.invoiceService = invoiceService;
        this.vendorBillService = vendorBillService;
        this.accountingEngineService = accountingEngineService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Dashboard Summary KPIs", description = "Retrieves unified operational, commercial, and financial KPIs for the dashboard console")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        return ResponseEntity.ok(reportService.getDashboardSummary());
    }

    @GetMapping("/balance-sheet")
    @Operation(summary = "Balance Sheet Report", description = "Generates Balance Sheet (Assets, Liabilities, Equity) from posted general ledger transactions")
    public ResponseEntity<BalanceSheetResponse> getBalanceSheet(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        return ResponseEntity.ok(reportService.generateBalanceSheet(asOfDate));
    }

    @GetMapping("/profit-loss")
    @Operation(summary = "Profit & Loss (P&L) Report", description = "Calculates Revenue, Operating Expenses, and Net Result over a specified date range")
    public ResponseEntity<ProfitLossResponse> getProfitLoss(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.generateProfitAndLoss(startDate, endDate));
    }

    @GetMapping("/budget")
    @Operation(summary = "Budget Variance Report", description = "Calculates planned vs actual expenditures by analytic account and GL code")
    public ResponseEntity<BudgetReportResponse> getBudgetReport(
            @RequestParam(required = false) Integer fiscalYear,
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(reportService.generateBudgetReport(fiscalYear, period));
    }

    @GetMapping("/resources")
    @Operation(summary = "Resource Reclamation & Consumption Report", description = "Aggregates Oxygen and Potable Water consumption from sensor telemetry and reports inventory stock levels")
    public ResponseEntity<ResourceReportResponse> getResourceReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long zoneId) {
        return ResponseEntity.ok(reportService.generateResourceReport(startDate, endDate, zoneId));
    }

    @GetMapping("/environment")
    @Operation(summary = "Environmental Stability Report", description = "Reports average, min, and max atmospheric pressure, water purity, CO2 levels, alert frequency, and automated scrubber adjustments")
    public ResponseEntity<EnvironmentalReportResponse> getEnvironmentalReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long zoneId) {
        return ResponseEntity.ok(reportService.generateEnvironmentalReport(startDate, endDate, zoneId));
    }

    @GetMapping("/accounts-receivable")
    @Operation(summary = "Accounts Receivable Report", description = "Retrieves accounts receivable / customer invoices summary")
    public ResponseEntity<org.springframework.data.domain.Page<com.lunar.habitat.entity.Invoice>> getAccountsReceivable(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(invoiceService.searchInvoices(null, null, null, null, null, pageable));
    }

    @GetMapping("/accounts-payable")
    @Operation(summary = "Accounts Payable Report", description = "Retrieves accounts payable / vendor bills summary")
    public ResponseEntity<org.springframework.data.domain.Page<com.lunar.habitat.entity.VendorBill>> getAccountsPayable(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(vendorBillService.searchVendorBills(null, null, null, pageable));
    }

    @GetMapping("/general-ledger")
    @Operation(summary = "General Ledger Report", description = "Retrieves double-entry general ledger transactions")
    public ResponseEntity<org.springframework.data.domain.Page<com.lunar.habitat.entity.JournalEntry>> getGeneralLedger(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(accountingEngineService.searchJournalEntries(null, null, null, null, pageable));
    }
}
