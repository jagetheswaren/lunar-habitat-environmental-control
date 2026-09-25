package com.lunar.habitat.controller.web;

import com.lunar.habitat.dto.request.HabitatZoneRequest;
import com.lunar.habitat.dto.request.ThresholdRequest;
import com.lunar.habitat.entity.AuditLog;
import com.lunar.habitat.entity.EnvironmentalThreshold;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.HabitatZoneService;
import com.lunar.habitat.service.ThresholdEngineService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
public class WebAdminController {

    private final HabitatZoneService habitatZoneService;
    private final ThresholdEngineService thresholdEngineService;
    private final AuditLogService auditLogService;

    public WebAdminController(HabitatZoneService habitatZoneService,
                              ThresholdEngineService thresholdEngineService,
                              AuditLogService auditLogService) {
        this.habitatZoneService = habitatZoneService;
        this.thresholdEngineService = thresholdEngineService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/habitat-zones")
    public String zonesPage(Model model) {
        List<HabitatZone> zones = habitatZoneService.getAllZones();
        model.addAttribute("zones", zones);
        model.addAttribute("zoneRequest", new HabitatZoneRequest());
        model.addAttribute("activeNav", "zones");
        return "admin/habitat-zones";
    }

    @PostMapping("/habitat-zones")
    public String createZone(@ModelAttribute HabitatZoneRequest request, RedirectAttributes redirectAttributes) {
        try {
            habitatZoneService.createZone(request);
            redirectAttributes.addFlashAttribute("successMessage", "Habitat Zone created successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/habitat-zones";
    }

    @GetMapping("/thresholds")
    public String thresholdsPage(Model model) {
        List<EnvironmentalThreshold> thresholds = thresholdEngineService.getAllThresholds();
        model.addAttribute("thresholds", thresholds);
        model.addAttribute("thresholdRequest", new ThresholdRequest());
        model.addAttribute("activeNav", "thresholds");
        return "admin/thresholds";
    }

    @PostMapping("/thresholds")
    public String createThreshold(@ModelAttribute ThresholdRequest request, RedirectAttributes redirectAttributes) {
        try {
            thresholdEngineService.createThreshold(request);
            redirectAttributes.addFlashAttribute("successMessage", "Safety threshold configured.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/thresholds";
    }

    @GetMapping("/audit-logs")
    public String auditLogsPage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<AuditLog> auditPage = auditLogService.searchAuditLogs(null, null, null, null, null, PageRequest.of(page, 25));
        model.addAttribute("auditPage", auditPage);
        model.addAttribute("activeNav", "audit-logs");
        return "admin/audit-logs";
    }

    @GetMapping("/settings")
    public String settingsPage(Model model) {
        model.addAttribute("activeNav", "settings");
        return "admin/settings";
    }
}
