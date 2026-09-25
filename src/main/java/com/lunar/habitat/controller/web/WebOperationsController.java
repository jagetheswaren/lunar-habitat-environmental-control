package com.lunar.habitat.controller.web;

import com.lunar.habitat.dto.request.MaintenanceRequest;
import com.lunar.habitat.dto.request.TelemetryIngestRequest;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.MaintenanceStatus;
import com.lunar.habitat.service.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping
public class WebOperationsController {

    private final TelemetryService telemetryService;
    private final AlertService alertService;
    private final ResourceInventoryService resourceInventoryService;
    private final EquipmentMaintenanceService maintenanceService;
    private final HabitatZoneService habitatZoneService;

    public WebOperationsController(TelemetryService telemetryService,
                                   AlertService alertService,
                                   ResourceInventoryService resourceInventoryService,
                                   EquipmentMaintenanceService maintenanceService,
                                   HabitatZoneService habitatZoneService) {
        this.telemetryService = telemetryService;
        this.alertService = alertService;
        this.resourceInventoryService = resourceInventoryService;
        this.maintenanceService = maintenanceService;
        this.habitatZoneService = habitatZoneService;
    }

    @GetMapping("/telemetry")
    public String telemetryPage(@RequestParam(defaultValue = "0") int page,
                                @RequestParam(required = false) Long zoneId,
                                Model model) {
        Page<Telemetry> telemetryPage = telemetryService.filterTelemetry(zoneId, null, null, null, null, PageRequest.of(page, 20));
        List<HabitatZone> zones = habitatZoneService.getAllZones();

        model.addAttribute("telemetryPage", telemetryPage);
        model.addAttribute("zones", zones);
        model.addAttribute("selectedZoneId", zoneId);
        model.addAttribute("telemetryRequest", new TelemetryIngestRequest());
        model.addAttribute("activeNav", "telemetry");
        return "operations/telemetry";
    }

    @PostMapping("/telemetry")
    public String ingestTelemetry(@ModelAttribute TelemetryIngestRequest request, RedirectAttributes redirectAttributes) {
        try {
            telemetryService.ingestTelemetry(request);
            redirectAttributes.addFlashAttribute("successMessage", "Environmental telemetry reading recorded and evaluated.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/telemetry";
    }

    @GetMapping("/alerts")
    public String alertsPage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<EnvironmentalAlert> alertsPage = alertService.searchAlerts(null, null, null, PageRequest.of(page, 20));
        model.addAttribute("alertsPage", alertsPage);
        model.addAttribute("activeNav", "alerts");
        return "operations/alerts";
    }

    @PostMapping("/alerts/{id}/acknowledge")
    public String acknowledgeAlert(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            alertService.acknowledgeAlert(id, "operator");
            redirectAttributes.addFlashAttribute("successMessage", "Alert acknowledged.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/alerts";
    }

    @PostMapping("/alerts/{id}/resolve")
    public String resolveAlert(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            alertService.resolveAlert(id, "operator");
            redirectAttributes.addFlashAttribute("successMessage", "Alert marked as RESOLVED.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/alerts";
    }

    @GetMapping("/resources")
    public String resourcesPage(Model model) {
        List<ResourceInventory> inventory = resourceInventoryService.getAllInventory();
        model.addAttribute("inventory", inventory);
        model.addAttribute("activeNav", "resources");
        return "operations/resources";
    }

    @GetMapping("/maintenance")
    public String maintenancePage(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<EquipmentMaintenance> maintenancePage = maintenanceService.searchMaintenance(null, null, PageRequest.of(page, 20));
        List<HabitatZone> zones = habitatZoneService.getAllZones();

        model.addAttribute("maintenancePage", maintenancePage);
        model.addAttribute("zones", zones);
        model.addAttribute("maintenanceRequest", new MaintenanceRequest());
        model.addAttribute("activeNav", "maintenance");
        return "operations/maintenance";
    }

    @PostMapping("/maintenance")
    public String scheduleMaintenance(@ModelAttribute MaintenanceRequest request, RedirectAttributes redirectAttributes) {
        try {
            maintenanceService.scheduleMaintenance(request);
            redirectAttributes.addFlashAttribute("successMessage", "Maintenance activity scheduled.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/maintenance";
    }

    @PostMapping("/maintenance/{id}/status")
    public String updateMaintenanceStatus(@PathVariable Long id, @RequestParam MaintenanceStatus status, RedirectAttributes redirectAttributes) {
        try {
            maintenanceService.updateStatus(id, status);
            redirectAttributes.addFlashAttribute("successMessage", "Maintenance status updated to " + status);
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/maintenance";
    }
}
