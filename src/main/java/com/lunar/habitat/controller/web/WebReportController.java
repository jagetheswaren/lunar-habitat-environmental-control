package com.lunar.habitat.controller.web;

import com.lunar.habitat.dto.response.*;
import com.lunar.habitat.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@Controller
@RequestMapping("/reports")
public class WebReportController {

    private final ReportService reportService;

    public WebReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/balance-sheet")
    public String balanceSheetPage(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate, Model model) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        BalanceSheetResponse report = reportService.generateBalanceSheet(date);
        model.addAttribute("report", report);
        model.addAttribute("asOfDate", date);
        model.addAttribute("activeNav", "balance-sheet");
        return "reports/balance-sheet";
    }

    @GetMapping("/profit-loss")
    public String profitLossPage(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                 Model model) {
        ProfitLossResponse report = reportService.generateProfitAndLoss(startDate, endDate);
        model.addAttribute("report", report);
        model.addAttribute("activeNav", "profit-loss");
        return "reports/profit-loss";
    }

    @GetMapping("/budget")
    public String budgetReportPage(@RequestParam(required = false) Integer fiscalYear,
                                   @RequestParam(required = false) String period,
                                   Model model) {
        int year = fiscalYear != null ? fiscalYear : LocalDate.now().getYear();
        BudgetReportResponse report = reportService.generateBudgetReport(year, period != null ? period : "ALL");
        model.addAttribute("report", report);
        model.addAttribute("fiscalYear", year);
        model.addAttribute("period", period);
        model.addAttribute("activeNav", "report-budget");
        return "reports/budget";
    }

    @GetMapping("/resources")
    public String resourceReportPage(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                     Model model) {
        ResourceReportResponse report = reportService.generateResourceReport(startDate, endDate, null);
        model.addAttribute("report", report);
        model.addAttribute("activeNav", "report-resources");
        return "reports/resources";
    }

    @GetMapping("/environment")
    public String environmentalReportPage(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                          Model model) {
        EnvironmentalReportResponse report = reportService.generateEnvironmentalReport(startDate, endDate, null);
        model.addAttribute("report", report);
        model.addAttribute("activeNav", "report-environment");
        return "reports/environment";
    }
}
