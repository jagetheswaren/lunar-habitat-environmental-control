package com.lunar.habitat.dto.response;

import java.util.List;

public class AuthResponse {

    private String token;
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private String username;
    private String fullName;
    private String email;
    private List<String> roles;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String fullName, String email, List<String> roles, String message) {
        this.token = token;
        this.accessToken = token;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.roles = roles;
        this.message = message;
    }

    public AuthResponse(String accessToken, String refreshToken, Long expiresIn, String username, String fullName, String email, List<String> roles, String message) {
        this.token = accessToken;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.roles = roles;
        this.message = message;
    }

    public AuthResponse(String username, String fullName, String email, List<String> roles, String message) {
        this(null, username, fullName, email, roles, message);
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
        this.accessToken = token;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
        this.token = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
