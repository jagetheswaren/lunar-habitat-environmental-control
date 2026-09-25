package com.lunar.habitat.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class WebAuthController {

    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                            @RequestParam(value = "logout", required = false) String logout,
                            Model model) {
        if (error != null) {
            model.addAttribute("errorMessage", "Invalid lunar operator ID or security key. Access denied.");
        }
        if (logout != null) {
            model.addAttribute("logoutMessage", "Secure terminal session terminated.");
        }
        return "login";
    }
}
