package com.lunar.habitat.dto.v2;

import java.util.List;

public class AuthV2Response {

    private String tokenType = "Bearer";
    private String accessToken;
    private String refreshToken;
    private long expiresIn; // seconds (e.g. 3600)
    private String username;
    private String fullName;
    private String email;
    private List<String> roles;
    private String message;

    public AuthV2Response() {}

    public AuthV2Response(String accessToken, String refreshToken, long expiresIn, String username,
                          String fullName, String email, List<String> roles, String message) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.roles = roles;
        this.message = message;
    }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
