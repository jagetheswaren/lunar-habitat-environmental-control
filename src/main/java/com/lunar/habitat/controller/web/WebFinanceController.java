package com.lunar.habitat.controller.web;

import com.lunar.habitat.dto.request.AccountRequest;
import com.lunar.habitat.dto.request.AnalyticAccountRequest;
import com.lunar.habitat.dto.request.BudgetRequest;
import com.lunar.habitat.dto.response.BudgetReportResponse;
import com.lunar.habitat.entity.Account;
import com.lunar.habitat.entity.AnalyticAccount;
import com.lunar.habitat.entity.Budget;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.JournalEntry;
import com.lunar.habitat.repository.AnalyticAccountRepository;
import com.lunar.habitat.service.AccountService;
import com.lunar.habitat.service.AccountingEngineService;
import com.lunar.habitat.service.BudgetService;
import com.lunar.habitat.service.HabitatZoneService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping
public class WebFinanceController {

    private final AccountService accountService;
    private final AccountingEngineService accountingEngineService;
    private final BudgetService budgetService;
    private final AnalyticAccountRepository analyticAccountRepository;
    private final HabitatZoneService habitatZoneService;

    public WebFinanceController(AccountService accountService,
                                AccountingEngineService accountingEngineService,
                                BudgetService budgetService,
                                AnalyticAccountRepository analyticAccountRepository,
                                HabitatZoneService habitatZoneService) {
        this.accountService = accountService;
        this.accountingEngineService = accountingEngineService;
        this.budgetService = budgetService;
        this.analyticAccountRepository = analyticAccountRepository;
        this.habitatZoneService = habitatZoneService;
    }

    @GetMapping({"/accounts", "/chart-of-accounts", "/finance/accounts"})
    public String accountsPage(Model model) {
        List<Account> accounts = accountService.getAllActiveAccounts();
        model.addAttribute("accounts", accounts);
        model.addAttribute("accountRequest", new AccountRequest());
        model.addAttribute("activeNav", "accounts");
        return "finance/accounts";
    }

    @PostMapping({"/accounts", "/chart-of-accounts", "/finance/accounts"})
    public String createAccount(@ModelAttribute AccountRequest request, RedirectAttributes redirectAttributes) {
        try {
            accountService.createAccount(request);
            redirectAttributes.addFlashAttribute("successMessage", "Account created successfully in Chart of Accounts.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/accounts";
    }

    @GetMapping({"/journals", "/journal-entries", "/finance/journals", "/finance/journals/entries"})
    public String journalsPage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<JournalEntry> entriesPage = accountingEngineService.searchJournalEntries(null, null, null, null, PageRequest.of(page, 20));
        model.addAttribute("entriesPage", entriesPage);
        model.addAttribute("activeNav", "journals");
        return "finance/journals";
    }

    @GetMapping("/budgets")
    public String budgetsPage(Model model) {
        int currentYear = LocalDate.now().getYear();
        BudgetReportResponse analysis = budgetService.calculateBudgetVsActual(currentYear, "ALL");
        List<AnalyticAccount> analyticAccounts = analyticAccountRepository.findAll();
        List<Account> accounts = accountService.getAllActiveAccounts();

        model.addAttribute("analysis", analysis);
        model.addAttribute("analyticAccounts", analyticAccounts);
        model.addAttribute("accounts", accounts);
        model.addAttribute("budgetRequest", new BudgetRequest());
        model.addAttribute("activeNav", "budgets");
        return "finance/budgets";
    }

    @PostMapping("/budgets")
    public String createBudget(@ModelAttribute BudgetRequest request, RedirectAttributes redirectAttributes) {
        try {
            budgetService.createBudget(request);
            redirectAttributes.addFlashAttribute("successMessage", "Budget allocation recorded successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/budgets";
    }

    @GetMapping({"/analytic-accounts", "/finance/analytic-accounts"})
    public String analyticAccountsPage(Model model) {
        List<AnalyticAccount> analyticAccounts = budgetService.getAllAnalyticAccounts();
        List<HabitatZone> zones = habitatZoneService.getAllZones();

        model.addAttribute("analyticAccounts", analyticAccounts);
        model.addAttribute("zones", zones);
        model.addAttribute("accountRequest", new AnalyticAccountRequest());
        model.addAttribute("activeNav", "analytic-accounts");
        return "finance/analytic-accounts";
    }

    @PostMapping({"/analytic-accounts", "/finance/analytic-accounts"})
    public String createAnalyticAccount(@ModelAttribute AnalyticAccountRequest request, RedirectAttributes redirectAttributes) {
        try {
            budgetService.createAnalyticAccount(request);
            redirectAttributes.addFlashAttribute("successMessage", "Analytic cost center account registered.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/analytic-accounts";
    }
}
