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

@Component
public class BearerTokenAuthFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenProvider jwtTokenProvider;

    public BearerTokenAuthFilter(CustomUserDetailsService userDetailsService, JwtTokenProvider jwtTokenProvider) {
        this.userDetailsService = userDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String uri = request.getRequestURI();

        // 1. Standard Authorization: Bearer header (Primary mechanism for REST and Authenticated Fetch Streaming)
        if (authHeader != null && (authHeader.startsWith("Bearer ") || authHeader.startsWith("bearer "))) {
            String token = authHeader.substring(7).trim();
            if (jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (userDetails != null && userDetails.isEnabled()) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        } else if (uri != null && uri.contains("/api/v2/telemetry/stream")) {
            // 2. Dedicated Single-Purpose 60-second Stream Ticket (URL Query parameter for EventSource)
            // Access tokens are strictly prohibited in URLs to prevent credential leakage in logs or referrers.
            String streamTicket = request.getParameter("ticket");
            if (streamTicket == null || streamTicket.isBlank()) {
                streamTicket = request.getParameter("stream_token");
            }
            if (streamTicket != null && !streamTicket.isBlank()) {
                String cleanTicket = streamTicket.trim();
                if (jwtTokenProvider.validateStreamToken(cleanTicket)) {
                    String username = jwtTokenProvider.getUsernameFromStreamToken(cleanTicket);
                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        if (userDetails != null && userDetails.isEnabled()) {
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        }
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
