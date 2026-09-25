package com.lunar.habitat.controller.web;

import com.lunar.habitat.dto.response.DashboardSummaryResponse;
import com.lunar.habitat.entity.EnvironmentalAlert;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.enums.AlertStatus;
import com.lunar.habitat.service.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class WebDashboardController {

    private final ReportService reportService;
    private final AlertService alertService;
    private final TelemetryService telemetryService;
    private final HabitatZoneService habitatZoneService;

    public WebDashboardController(ReportService reportService,
                                  AlertService alertService,
                                  TelemetryService telemetryService,
                                  HabitatZoneService habitatZoneService) {
        this.reportService = reportService;
        this.alertService = alertService;
        this.telemetryService = telemetryService;
        this.habitatZoneService = habitatZoneService;
    }

    @GetMapping({"/", "/dashboard"})
    public String dashboard(Model model) {
        DashboardSummaryResponse summary = reportService.getDashboardSummary();
        List<EnvironmentalAlert> openAlerts = alertService.getOpenAlerts();
        List<HabitatZone> zones = habitatZoneService.getAllZones();

        model.addAttribute("summary", summary);
        model.addAttribute("openAlerts", openAlerts);
        model.addAttribute("zones", zones);
        model.addAttribute("activeNav", "dashboard");

        return "dashboard";
    }
}
