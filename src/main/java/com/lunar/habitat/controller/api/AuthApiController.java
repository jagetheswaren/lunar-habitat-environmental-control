package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.LoginRequest;
import com.lunar.habitat.dto.response.AuthResponse;
import com.lunar.habitat.entity.User;
import com.lunar.habitat.repository.UserRepository;
import com.lunar.habitat.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/lunar/auth")
@Tag(name = "Authentication", description = "Authentication and current user session endpoints")
public class AuthApiController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    public AuthApiController(AuthenticationManager authenticationManager, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user credentials and establishes security session")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new AuthResponse(
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                roles,
                "Authentication successful"));
    }

    @GetMapping("/me")
    @Operation(summary = "Current User Profile", description = "Retrieves information about currently authenticated user")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new AuthResponse(
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                roles,
                "Session active"));
    }
}
