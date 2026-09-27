package com.lunar.habitat.controller.web;

import com.lunar.habitat.dto.request.HabitatZoneRequest;
import com.lunar.habitat.dto.request.ThresholdRequest;
import com.lunar.habitat.dto.request.UserRequest;
import com.lunar.habitat.entity.AuditLog;
import com.lunar.habitat.entity.EnvironmentalThreshold;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.Role;
import com.lunar.habitat.entity.User;
import com.lunar.habitat.enums.RoleType;
import com.lunar.habitat.repository.RoleRepository;
import com.lunar.habitat.repository.UserRepository;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.HabitatZoneService;
import com.lunar.habitat.service.ThresholdEngineService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Set;

@Controller
public class WebAdminController {

    private final HabitatZoneService habitatZoneService;
    private final ThresholdEngineService thresholdEngineService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public WebAdminController(HabitatZoneService habitatZoneService,
                              ThresholdEngineService thresholdEngineService,
                              AuditLogService auditLogService,
                              UserRepository userRepository,
                              RoleRepository roleRepository,
                              PasswordEncoder passwordEncoder) {
        this.habitatZoneService = habitatZoneService;
        this.thresholdEngineService = thresholdEngineService;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping({"/habitat-zones", "/zones", "/admin/zones", "/admin/habitat-zones"})
    public String zonesPage(Model model) {
        List<HabitatZone> zones = habitatZoneService.getAllZones();
        model.addAttribute("zones", zones);
        model.addAttribute("zoneRequest", new HabitatZoneRequest());
        model.addAttribute("activeNav", "zones");
        return "admin/habitat-zones";
    }

    @PostMapping({"/habitat-zones", "/zones", "/admin/zones", "/admin/habitat-zones"})
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

    @GetMapping({"/users", "/admin/users"})
    public String usersPage(Model model) {
        List<User> users = userRepository.findAll();
        model.addAttribute("users", users);
        model.addAttribute("userRequest", new UserRequest());
        model.addAttribute("activeNav", "users");
        return "admin/users";
    }

    @PostMapping({"/users", "/admin/users"})
    public String createUser(@ModelAttribute UserRequest request, RedirectAttributes redirectAttributes) {
        try {
            User existing = userRepository.findByUsername(request.getUsername()).orElse(null);
            if (existing != null) {
                existing.setFullName(request.getFullName());
                existing.setEmail(request.getEmail());
                if (request.getPassword() != null && !request.getPassword().isBlank()) {
                    existing.setPassword(passwordEncoder.encode(request.getPassword()));
                }
                userRepository.save(existing);
                redirectAttributes.addFlashAttribute("successMessage", "Personnel record updated.");
            } else {
                User user = new User(
                        request.getUsername(),
                        passwordEncoder.encode(request.getPassword()),
                        request.getEmail(),
                        request.getFullName()
                );
                String roleStr = request.getRole() != null ? request.getRole().toUpperCase() : "ROLE_HABITAT_OPERATOR";
                if (!roleStr.startsWith("ROLE_")) {
                    roleStr = "ROLE_" + roleStr;
                }
                RoleType roleType = RoleType.valueOf(roleStr);
                Role role = roleRepository.findByName(roleType)
                        .orElseGet(() -> roleRepository.save(new Role(roleType, roleType.name())));
                user.setRoles(Set.of(role));
                userRepository.save(user);
                redirectAttributes.addFlashAttribute("successMessage", "New operator registered with clearance: " + roleType.name());
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/users";
    }

    @GetMapping({"/admin", "/admin/settings", "/settings"})
    public String settingsPage(Model model) {
        model.addAttribute("activeNav", "settings");
        return "admin/settings";
    }
}
