package com.dayflow.hrms.dto.auth;

import com.dayflow.hrms.enums.RoleType;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String employeeId;
    private String email;
    private String firstName;
    private String lastName;
    private RoleType role;
    private boolean emailVerified;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long userId, String employeeId, String email, String firstName, String lastName, RoleType role, boolean emailVerified) {
        this.token = token;
        this.tokenType = "Bearer";
        this.userId = userId;
        this.employeeId = employeeId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.emailVerified = emailVerified;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public RoleType getRole() {
        return role;
    }

    public void setRole(RoleType role) {
        this.role = role;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
