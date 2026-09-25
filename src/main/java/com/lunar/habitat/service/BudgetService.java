package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.BudgetRequest;
import com.lunar.habitat.dto.response.BudgetReportResponse;
import com.lunar.habitat.entity.Budget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface BudgetService {
    Budget createBudget(BudgetRequest request);
    Budget updateBudget(Long id, BudgetRequest request);
    Budget getBudgetById(Long id);
    List<Budget> getAllBudgets();
    List<Budget> getBudgetsByFiscalYear(Integer fiscalYear);
    Page<Budget> searchBudgets(Integer fiscalYear, Long analyticAccountId, Long accountId, Pageable pageable);
    BudgetReportResponse calculateBudgetVsActual(Integer fiscalYear, String period);
    void deleteBudget(Long id);
}
