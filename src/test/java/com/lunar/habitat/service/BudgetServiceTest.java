package com.lunar.habitat.service;

import com.lunar.habitat.dto.response.BudgetReportResponse;
import com.lunar.habitat.entity.Account;
import com.lunar.habitat.entity.AnalyticAccount;
import com.lunar.habitat.entity.Budget;
import com.lunar.habitat.enums.AccountType;
import com.lunar.habitat.repository.AccountRepository;
import com.lunar.habitat.repository.AnalyticAccountRepository;
import com.lunar.habitat.repository.BudgetRepository;
import com.lunar.habitat.repository.JournalEntryLineRepository;
import com.lunar.habitat.service.impl.BudgetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private AnalyticAccountRepository analyticAccountRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private JournalEntryLineRepository journalEntryLineRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private BudgetServiceImpl budgetService;

    private AnalyticAccount zoneAlpha;
    private Account scrubberExpense;

    @BeforeEach
    void setUp() {
        zoneAlpha = new AnalyticAccount("AA-DOME-A", "Habitat Dome Alpha Zone", "Dome life support");
        zoneAlpha.setId(1L);

        scrubberExpense = new Account("5000", "Scrubber Maintenance Expenditures", AccountType.EXPENSE);
        scrubberExpense.setId(2L);
    }

    @Test
    @DisplayName("Should accurately calculate budget vs actuals, variance, and variance percentage")
    void testCalculateBudgetVsActuals() {
        Budget budget = new Budget(zoneAlpha, scrubberExpense, 2026, "ALL", new BigDecimal("30000.00"), "Annual maintenance target");
        budget.setId(10L);

        when(budgetRepository.findByFiscalYear(2026)).thenReturn(Collections.singletonList(budget));
        // Actual from ledger = 24000.00
        when(journalEntryLineRepository.calculateActualAmountForAnalyticAccountAndAccount(1L, 2L))
                .thenReturn(new BigDecimal("24000.00"));

        BudgetReportResponse response = budgetService.calculateBudgetVsActual(2026, "ALL");

        assertNotNull(response);
        assertEquals(2026, response.getFiscalYear());
        assertEquals("ALL", response.getPeriod());
        assertEquals(new BigDecimal("30000.00"), response.getTotalPlanned());
        assertEquals(new BigDecimal("24000.00"), response.getTotalActual());

        // Variance = Actual - Planned = 24000 - 30000 = -6000
        assertEquals(new BigDecimal("-6000.00"), response.getTotalVariance());

        // Variance % = (-6000 / 30000) * 100 = -20.00%
        assertEquals(new BigDecimal("-20.00"), response.getOverallVariancePercent());

        assertEquals(1, response.getItems().size());
        BudgetReportResponse.BudgetLineItem item = response.getItems().get(0);
        assertEquals("5000", item.getAccountCode());
        assertEquals(new BigDecimal("-6000.00"), item.getVariance());
    }
}
