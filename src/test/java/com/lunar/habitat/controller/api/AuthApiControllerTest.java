package com.lunar.habitat.controller.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lunar.habitat.dto.request.LoginRequest;
import com.lunar.habitat.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("POST /api/v1/lunar/auth/login authenticates valid user and returns signed JWT access & refresh tokens")
    void testLoginSuccessIssuesSignedJwt() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setUsername("admin");
        login.setPassword("admin123");

        MvcResult result = mockMvc.perform(post("/api/v1/lunar/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.username").value("admin"))
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        Map<?, ?> responseMap = objectMapper.readValue(responseStr, Map.class);
        String token = (String) responseMap.get("token");

        // Verify the token is cryptographically valid
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUsernameFromToken(token)).isEqualTo("admin");
    }

    @Test
    @DisplayName("SECURITY VERIFICATION: Forged Base64 Bearer token is rejected with HTTP 401 Unauthorized")
    void testForgedTokenRejected() throws Exception {
        // Attempt the old Base64 bypass: base64("admin:forged_fake_password_12345")
        String forgedToken = "YWRtaW46Zm9yZ2VkX2Zha2VfcGFzc3dvcmRfMTIzNDU=";

        mockMvc.perform(get("/api/v1/lunar/telemetry")
                        .header("Authorization", "Bearer " + forgedToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("SECURITY VERIFICATION: Tampered signature on valid JWT is rejected with HTTP 401 Unauthorized")
    void testTamperedJwtSignatureRejected() throws Exception {
        String validToken = jwtTokenProvider.generateAccessToken("admin", List.of("ROLE_ADMIN"));
        // Tamper with the signature portion
        String tamperedToken = validToken.substring(0, validToken.length() - 5) + "XXXXX";

        mockMvc.perform(get("/api/v1/lunar/telemetry")
                        .header("Authorization", "Bearer " + tamperedToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Valid signed JWT grants access to protected endpoint")
    void testValidJwtGrantsAccess() throws Exception {
        String validToken = jwtTokenProvider.generateAccessToken("admin", List.of("ROLE_ADMIN"));

        mockMvc.perform(get("/api/v1/lunar/telemetry")
                        .header("Authorization", "Bearer " + validToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Token refresh rotates refresh token and issues new access token")
    void testTokenRefreshRotation() throws Exception {
        String refreshToken = jwtTokenProvider.generateRefreshToken("admin");

        MvcResult result = mockMvc.perform(post("/api/v1/lunar/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andReturn();

        // Old refresh token is revoked
        assertThat(jwtTokenProvider.isTokenRevoked(refreshToken)).isTrue();
    }

    @Test
    @DisplayName("Logout revokes the access token so subsequent requests are rejected")
    void testLogoutRevocation() throws Exception {
        String token = jwtTokenProvider.generateAccessToken("admin", List.of("ROLE_ADMIN"));

        // Logout
        mockMvc.perform(post("/api/v1/lunar/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REVOKED"));

        // Token is now blacklisted/revoked
        assertThat(jwtTokenProvider.isTokenRevoked(token)).isTrue();
        assertThat(jwtTokenProvider.validateToken(token)).isFalse();

        // Accessing protected endpoint with revoked token is rejected
        mockMvc.perform(get("/api/v1/lunar/telemetry")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
