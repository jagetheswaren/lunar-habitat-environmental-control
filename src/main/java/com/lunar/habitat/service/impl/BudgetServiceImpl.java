package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.BudgetRequest;
import com.lunar.habitat.dto.response.BudgetReportResponse;
import com.lunar.habitat.entity.Account;
import com.lunar.habitat.entity.AnalyticAccount;
import com.lunar.habitat.entity.Budget;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.exception.DuplicateResourceException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.AccountRepository;
import com.lunar.habitat.repository.AnalyticAccountRepository;
import com.lunar.habitat.repository.BudgetRepository;
import com.lunar.habitat.repository.JournalEntryLineRepository;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.BudgetService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final AnalyticAccountRepository analyticAccountRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;
    private final AuditLogService auditLogService;

    public BudgetServiceImpl(BudgetRepository budgetRepository,
                             AnalyticAccountRepository analyticAccountRepository,
                             AccountRepository accountRepository,
                             JournalEntryLineRepository journalEntryLineRepository,
                             AuditLogService auditLogService) {
        this.budgetRepository = budgetRepository;
        this.analyticAccountRepository = analyticAccountRepository;
        this.accountRepository = accountRepository;
        this.journalEntryLineRepository = journalEntryLineRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public Budget createBudget(BudgetRequest request) {
        AnalyticAccount analytic = analyticAccountRepository.findById(request.getAnalyticAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Analytic Account not found with ID: " + request.getAnalyticAccountId()));

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("GL Account not found with ID: " + request.getAccountId()));

        budgetRepository.findByAnalyticAccountIdAndAccountIdAndFiscalYearAndPeriod(
                analytic.getId(), account.getId(), request.getFiscalYear(), request.getPeriod())
                .ifPresent(b -> {
                    throw new DuplicateResourceException(String.format(
                            "Budget already exists for %s on account %s for FY%d %s",
                            analytic.getName(), account.getAccountCode(), request.getFiscalYear(), request.getPeriod()));
                });

        Budget budget = new Budget(analytic, account, request.getFiscalYear(), request.getPeriod(), request.getPlannedAmount(), request.getNotes());

        Budget saved = budgetRepository.save(budget);
        auditLogService.logAction(AuditAction.CREATE, "BUDGET", saved.getId(), null,
                String.format("Created budget for %s / %s (FY%d %s) Planned: %.2f",
                        analytic.getCode(), account.getAccountCode(), saved.getFiscalYear(), saved.getPeriod(), saved.getPlannedAmount()));
        return saved;
    }

    @Override
    public Budget updateBudget(Long id, BudgetRequest request) {
        Budget budget = getBudgetById(id);

        AnalyticAccount analytic = analyticAccountRepository.findById(request.getAnalyticAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Analytic Account not found with ID: " + request.getAnalyticAccountId()));

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("GL Account not found with ID: " + request.getAccountId()));

        budget.setAnalyticAccount(analytic);
        budget.setAccount(account);
        budget.setFiscalYear(request.getFiscalYear());
        budget.setPeriod(request.getPeriod());
        budget.setPlannedAmount(request.getPlannedAmount());
        budget.setNotes(request.getNotes());

        Budget saved = budgetRepository.save(budget);
        auditLogService.logAction(AuditAction.UPDATE, "BUDGET", saved.getId(), null, "Updated budget " + saved.getId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Budget getBudgetById(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Budget> getBudgetsByFiscalYear(Integer fiscalYear) {
        return budgetRepository.findByFiscalYear(fiscalYear);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Budget> searchBudgets(Integer fiscalYear, Long analyticAccountId, Long accountId, Pageable pageable) {
        return budgetRepository.searchBudgets(fiscalYear, analyticAccountId, accountId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetReportResponse calculateBudgetVsActual(Integer fiscalYear, String period) {
        int year = (fiscalYear != null) ? fiscalYear : java.time.LocalDate.now().getYear();
        List<Budget> budgets = budgetRepository.findByFiscalYear(year);

        BudgetReportResponse response = new BudgetReportResponse();
        response.setFiscalYear(year);
        response.setPeriod(period != null ? period : "ALL");

        List<BudgetReportResponse.BudgetLineItem> items = new ArrayList<>();
        BigDecimal totalPlanned = BigDecimal.ZERO;
        BigDecimal totalActual = BigDecimal.ZERO;

        for (Budget b : budgets) {
            if (period != null && !period.equalsIgnoreCase("ALL") && !b.getPeriod().equalsIgnoreCase(period)) {
                continue;
            }

            // Real actuals computed from posted double-entry journal transactions
            BigDecimal actualAmount = journalEntryLineRepository.calculateActualAmountForAnalyticAccountAndAccount(
                    b.getAnalyticAccount().getId(), b.getAccount().getId());

            if (actualAmount == null) {
                actualAmount = BigDecimal.ZERO;
            }

            BudgetReportResponse.BudgetLineItem item = new BudgetReportResponse.BudgetLineItem(
                    b.getAccount().getAccountCode(),
                    b.getAccount().getAccountName(),
                    b.getAccount().getAccountType().name(),
                    b.getAnalyticAccount().getCode(),
                    b.getAnalyticAccount().getName(),
                    b.getPeriod(),
                    b.getPlannedAmount(),
                    actualAmount);

            items.add(item);
            totalPlanned = totalPlanned.add(b.getPlannedAmount());
            totalActual = totalActual.add(actualAmount);
        }

        response.setItems(items);
        response.setTotalPlanned(totalPlanned);
        response.setTotalActual(totalActual);
        BigDecimal totalVariance = totalActual.subtract(totalPlanned);
        response.setTotalVariance(totalVariance);

        if (totalPlanned.compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal variancePercent = totalVariance.multiply(new BigDecimal("100"))
                    .divide(totalPlanned, 2, RoundingMode.HALF_UP);
            response.setOverallVariancePercent(variancePercent);
        } else {
            response.setOverallVariancePercent(BigDecimal.ZERO);
        }

        return response;
    }

    @Override
    public void deleteBudget(Long id) {
        Budget budget = getBudgetById(id);
        budgetRepository.delete(budget);
        auditLogService.logAction(AuditAction.DELETE, "BUDGET", id, "Budget ID: " + id, "DELETED");
    }
}
