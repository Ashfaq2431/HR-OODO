package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.auth.AuthResponse;
import com.dayflow.hrms.dto.auth.LoginRequest;
import com.dayflow.hrms.dto.auth.SignUpRequest;
import com.dayflow.hrms.dto.auth.VerifyEmailRequest;
import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signUp(@Valid @RequestBody SignUpRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AuthResponse response = authService.signUp(request, ip);
        return ResponseEntity.ok(ApiResponse.ok("User registered successfully. Please verify your email.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AuthResponse response = authService.signIn(request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Logged in successfully", response));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.getToken());
        return ResponseEntity.ok(ApiResponse.ok("Email verified successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated", "UNAUTHORIZED"));
        }
        AuthResponse response = authService.getCurrentUser(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Current user retrieved", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }
}
