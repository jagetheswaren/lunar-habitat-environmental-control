package com.lunar.habitat.controller.api.v2;

import com.lunar.habitat.dto.response.DashboardSummaryResponse;
import com.lunar.habitat.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v2/dashboard")
@Tag(name = "Dashboard V2", description = "Real-time Lunar Mission Control Dashboard Metrics")
public class DashboardV2ApiController {

    private final ReportService reportService;

    public DashboardV2ApiController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    @Operation(summary = "Mission Control Dashboard", description = "Aggregates environmental KPIs, life support metrics, alert status, and operational financials")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        return ResponseEntity.ok(reportService.getDashboardSummary());
    }

    @GetMapping("/summary")
    @Operation(summary = "Mission Control Summary Alias", description = "Alias endpoint for dashboard summary metrics")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummaryAlias() {
        return ResponseEntity.ok(reportService.getDashboardSummary());
    }
}
