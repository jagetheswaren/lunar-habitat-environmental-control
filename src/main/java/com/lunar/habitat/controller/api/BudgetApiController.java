package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.BudgetRequest;
import com.lunar.habitat.dto.response.BudgetReportResponse;
import com.lunar.habitat.entity.Budget;
import com.lunar.habitat.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lunar/budgets")
@Tag(name = "Budgets & Analytic Accounts", description = "Operational Budgeting and Budget vs Actuals Variance API")
public class BudgetApiController {

    private final BudgetService budgetService;

    public BudgetApiController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Create Budget", description = "Allocates a budget for a GL account within an analytic account / habitat dome")
    public ResponseEntity<Budget> createBudget(@Valid @RequestBody BudgetRequest request) {
        Budget created = budgetService.createBudget(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Search Budgets", description = "Retrieves paginated budgets with fiscal year, analytic account, and GL account filters")
    public ResponseEntity<Page<Budget>> searchBudgets(
            @RequestParam(required = false) Integer fiscalYear,
            @RequestParam(required = false) Long analyticAccountId,
            @RequestParam(required = false) Long accountId,
            Pageable pageable) {
        return ResponseEntity.ok(budgetService.searchBudgets(fiscalYear, analyticAccountId, accountId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Budget by ID", description = "Retrieves budget allocation by ID")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getBudgetById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Budget", description = "Modifies existing budget allocation")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.updateBudget(id, request));
    }

    @GetMapping("/analysis")
    @Operation(summary = "Budget vs Actual Analysis",
            description = "Calculates actual financial amounts from posted general ledger transactions, compares against planned budget, and computes variance & variance %")
    public ResponseEntity<BudgetReportResponse> getBudgetVsActual(
            @RequestParam(required = false) Integer fiscalYear,
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(budgetService.calculateBudgetVsActual(fiscalYear, period));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Budget", description = "Removes a budget entry")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
