package com.lunar.habitat.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenValiditySeconds = 1800; // 30 minutes
    private final long refreshTokenValiditySeconds = 86400 * 7; // 7 days
    private final Set<String> revokedTokens = ConcurrentHashMap.newKeySet();

    public JwtTokenProvider(
            @Value("${JWT_SECRET:${jwt.secret:}}") String secret,
            @Value("${spring.profiles.active:local}") String activeProfile) {
        if ("prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile)) {
            if (secret == null || secret.isBlank() || secret.equals("LunarHabitatMissionOperationsSecretKey2026SecureHmacSha256Signature")) {
                throw new IllegalStateException("CRITICAL SECURITY ERROR: Production deployment requires a cryptographically strong JWT_SECRET environment variable. Fallback keys are prohibited in production profile.");
            }
        }
        if (secret == null || secret.isBlank()) {
            secret = "LunarHabitatMissionOperationsSecretKey2026SecureHmacSha256Signature";
        }
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(secretBytes, 0, padded, 0, secretBytes.length);
            secretBytes = padded;
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
    }

    public String generateAccessToken(String username, List<String> roles) {
        return buildJwt(username, roles, accessTokenValiditySeconds);
    }

    public String generateRefreshToken(String username) {
        return buildJwt(username, Collections.singletonList("REFRESH"), refreshTokenValiditySeconds);
    }

    private String buildJwt(String username, List<String> roles, long validitySeconds) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + validitySeconds * 1000);

        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        String cleanToken = token.trim();
        if (revokedTokens.contains(cleanToken)) {
            return false;
        }
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(cleanToken)
                    .getPayload();

            Date expiration = claims.getExpiration();
            return expiration == null || expiration.after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public void revokeToken(String token) {
        if (token != null && !token.isBlank()) {
            revokedTokens.add(token.trim());
        }
    }

    public boolean isTokenRevoked(String token) {
        return token != null && revokedTokens.contains(token.trim());
    }

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token.trim())
                    .getPayload();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token.trim())
                    .getPayload();
            Object rolesObj = claims.get("roles");
            if (rolesObj instanceof List<?>) {
                return (List<String>) rolesObj;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public long getAccessTokenValiditySeconds() {
        return accessTokenValiditySeconds;
    }

    public long getRefreshTokenValiditySeconds() {
        return refreshTokenValiditySeconds;
    }
}
