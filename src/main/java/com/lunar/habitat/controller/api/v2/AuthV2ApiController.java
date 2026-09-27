package com.lunar.habitat.controller.api.v2;

import com.lunar.habitat.dto.request.LoginRequest;
import com.lunar.habitat.dto.v2.AuthV2Response;
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
@RequestMapping("/api/v2/auth")
@Tag(name = "Authentication V2 (JWT)", description = "Modern JWT access and refresh token authentication")
public class AuthV2ApiController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthV2ApiController(AuthenticationManager authenticationManager,
                               UserRepository userRepository,
                               JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    @Operation(summary = "JWT User Login", description = "Authenticates credentials and returns JWT access and refresh tokens")
    public ResponseEntity<AuthV2Response> login(@Valid @RequestBody LoginRequest request) {
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

        return ResponseEntity.ok(new AuthV2Response(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenValiditySeconds(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                roles,
                "JWT authentication successful"
        ));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT Tokens", description = "Generates new JWT access and refresh tokens from a valid refresh token")
    public ResponseEntity<AuthV2Response> refresh(@RequestBody Map<String, String> body) {
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

        // Token rotation: revoke old refresh token
        jwtTokenProvider.revokeToken(refreshToken);

        String newAccessToken = jwtTokenProvider.generateAccessToken(username, roles);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);

        return ResponseEntity.ok(new AuthV2Response(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenValiditySeconds(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                roles,
                "JWT tokens rotated successfully"
        ));
    }

    @PostMapping("/logout")
    @Operation(summary = "JWT Logout", description = "Revokes access token and invalidates active session")
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
    @Operation(summary = "Current Authenticated Profile V2", description = "Returns active identity and role assignments")
    public ResponseEntity<AuthV2Response> getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null || "anonymousUser".equalsIgnoreCase(username)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new AuthV2Response(
                null,
                null,
                jwtTokenProvider.getAccessTokenValiditySeconds(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                roles,
                "Session active"
        ));
    }
}
