package com.lunar.habitat.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class BearerTokenAuthFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;

    public BearerTokenAuthFilter(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && (authHeader.startsWith("Bearer ") || authHeader.startsWith("bearer "))) {
            String token = authHeader.substring(7).trim();
            if (token.startsWith("Basic ") || token.startsWith("basic ")) {
                token = token.substring(6).trim();
            }

            try {
                byte[] decoded = Base64.getDecoder().decode(token);
                String credentials = new String(decoded, StandardCharsets.UTF_8);
                String[] parts = credentials.split(":", 2);
                if (parts.length == 2) {
                    String username = parts[0];
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (userDetails != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception ignored) {
                // Let other filters handle or reject
            }
        }

        filterChain.doFilter(request, response);
    }
}
