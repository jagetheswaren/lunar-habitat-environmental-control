package com.lunar.habitat.dto.response;

import java.util.List;

public class AuthResponse {

    private String username;
    private String fullName;
    private String email;
    private List<String> roles;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String username, String fullName, String email, List<String> roles, String message) {
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.roles = roles;
        this.message = message;
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
