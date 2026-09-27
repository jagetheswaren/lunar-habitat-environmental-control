package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.LoginRequest;
import com.lunar.habitat.dto.response.AuthResponse;
import com.lunar.habitat.entity.User;
import com.lunar.habitat.repository.UserRepository;
import com.lunar.habitat.security.JwtTokenProvider;
import com.lunar.habitat.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/lunar/auth")
@Tag(name = "Authentication", description = "Authentication and current user session endpoints")
public class AuthApiController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthApiController(AuthenticationManager authenticationManager,
                             UserRepository userRepository,
                             JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user credentials and returns signed JWT access and refresh tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUsername()));

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String accessToken = jwtTokenProvider.generateAccessToken(user.getUsername(), roles);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());

        return ResponseEntity.ok(new AuthResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenValiditySeconds(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                roles,
                "Authentication successful"
        ));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Token", description = "Generates new JWT access and refresh tokens from a valid refresh token")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        // Revoke the old refresh token (rotation)
        jwtTokenProvider.revokeToken(refreshToken);

        String newAccessToken = jwtTokenProvider.generateAccessToken(username, roles);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);

        return ResponseEntity.ok(new AuthResponse(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenValiditySeconds(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                roles,
                "Token refreshed successfully"
        ));
    }

    @PostMapping("/logout")
    @Operation(summary = "User Logout", description = "Revokes access token and invalidates active session")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            jwtTokenProvider.revokeToken(token);
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully", "status", "REVOKED"));
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
