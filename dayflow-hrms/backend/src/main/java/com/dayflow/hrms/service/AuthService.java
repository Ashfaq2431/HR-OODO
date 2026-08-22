package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.auth.AuthResponse;
import com.dayflow.hrms.dto.auth.LoginRequest;
import com.dayflow.hrms.dto.auth.SignUpRequest;
import com.dayflow.hrms.security.UserPrincipal;

public interface AuthService {
    AuthResponse signUp(SignUpRequest request, String ipAddress);
    AuthResponse signIn(LoginRequest request, String ipAddress);
    boolean verifyEmail(String token);
    AuthResponse getCurrentUser(UserPrincipal currentUser);
}
