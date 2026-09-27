package com.lunar.habitat.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;

@Component
public class JwtTokenProvider {

    private final byte[] secretKeyBytes;
    private final long accessTokenValiditySeconds = 3600; // 1 hour
    private final long refreshTokenValiditySeconds = 86400 * 7; // 7 days
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtTokenProvider(@Value("${jwt.secret:LunarHabitatMissionOperationsSecretKey2026SecureHmacSha256Signature}") String secret) {
        this.secretKeyBytes = secret.getBytes(StandardCharsets.UTF_8);
    }

    public String generateAccessToken(String username, List<String> roles) {
        return buildJwt(username, roles, accessTokenValiditySeconds);
    }

    public String generateRefreshToken(String username) {
        return buildJwt(username, Collections.singletonList("REFRESH"), refreshTokenValiditySeconds);
    }

    private String buildJwt(String username, List<String> roles, long validitySeconds) {
        try {
            long now = Instant.now().getEpochSecond();
            long exp = now + validitySeconds;

            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", username);
            payload.put("roles", roles);
            payload.put("iat", now);
            payload.put("exp", exp);

            String encodedHeader = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(header));
            String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(payload));

            String contentToSign = encodedHeader + "." + encodedPayload;
            String signature = sign(contentToSign);

            return contentToSign + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }

            String contentToSign = parts[0] + "." + parts[1];
            String expectedSignature = sign(contentToSign);

            if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            // Check expiration
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> payload = objectMapper.readValue(payloadBytes, Map.class);
            Number exp = (Number) payload.get("exp");
            if (exp != null && exp.longValue() < Instant.now().getEpochSecond()) {
                return false;
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> payload = objectMapper.readValue(payloadBytes, Map.class);
            return (String) payload.get("sub");
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> payload = objectMapper.readValue(payloadBytes, Map.class);
            return (List<String>) payload.get("roles");
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String sign(String data) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secretKeyBytes, "HmacSHA256");
        hmac.init(secretKey);
        byte[] rawHmac = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
    }
}
