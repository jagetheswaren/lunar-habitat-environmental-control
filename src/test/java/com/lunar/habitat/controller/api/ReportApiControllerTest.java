package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.response.BalanceSheetResponse;
import com.lunar.habitat.dto.response.DashboardSummaryResponse;
import com.lunar.habitat.dto.response.ProfitLossResponse;
import com.lunar.habitat.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ReportApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/lunar/reports/summary returns dashboard KPI summary metrics")
    void testGetDashboardSummary() throws Exception {
        DashboardSummaryResponse summary = new DashboardSummaryResponse();
        summary.setTotalCustomers(5L);
        summary.setTotalVendors(3L);
        summary.setOpenAlerts(2L);
        summary.setOxygenConsumption24h(new BigDecimal("1250.00"));
        summary.setWaterConsumption24h(new BigDecimal("8400.00"));
        summary.setCurrentMonthRevenue(new BigDecimal("42000.00"));
        summary.setCurrentMonthExpenses(new BigDecimal("24000.00"));
        summary.setSystemStatus("OPERATIONAL");

        when(reportService.getDashboardSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/lunar/reports/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCustomers").value(5))
                .andExpect(jsonPath("$.systemStatus").value("OPERATIONAL"))
                .andExpect(jsonPath("$.currentMonthRevenue").value(42000.00));
    }

    @Test
    @WithMockUser(roles = "ACCOUNTANT")
    @DisplayName("GET /api/v1/lunar/reports/balance-sheet returns Assets, Liabilities, and Equity")
    void testGetBalanceSheet() throws Exception {
        BalanceSheetResponse bs = new BalanceSheetResponse();
        bs.setAsOfDate(LocalDate.now());
        bs.setTotalAssets(new BigDecimal("250000.00"));
        bs.setTotalLiabilities(new BigDecimal("50000.00"));
        bs.setTotalEquity(new BigDecimal("200000.00"));
        bs.setTotalLiabilitiesAndEquity(new BigDecimal("250000.00"));
        bs.setBalanced(true);

        when(reportService.generateBalanceSheet(any())).thenReturn(bs);

        mockMvc.perform(get("/api/v1/lunar/reports/balance-sheet")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssets").value(250000.00))
                .andExpect(jsonPath("$.totalLiabilities").value(50000.00))
                .andExpect(jsonPath("$.balanced").value(true));
    }

    @Test
    @WithMockUser(roles = "ACCOUNTANT")
    @DisplayName("GET /api/v1/lunar/reports/profit-loss calculates Revenue, Expenses, and Net Result")
    void testGetProfitLoss() throws Exception {
        ProfitLossResponse pl = new ProfitLossResponse();
        pl.setTotalRevenue(new BigDecimal("50000.00"));
        pl.setTotalExpenses(new BigDecimal("32000.00"));
        pl.setNetResult(new BigDecimal("18000.00"));

        when(reportService.generateProfitAndLoss(any(), any())).thenReturn(pl);

        mockMvc.perform(get("/api/v1/lunar/reports/profit-loss")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(50000.00))
                .andExpect(jsonPath("$.totalExpenses").value(32000.00))
                .andExpect(jsonPath("$.netResult").value(18000.00));
    }
}
