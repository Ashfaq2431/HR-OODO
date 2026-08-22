package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.profile.AdminOverrideProfileRequest;
import com.dayflow.hrms.dto.profile.EmployeeProfileDto;
import com.dayflow.hrms.entity.AuditLog;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.AuditLogService;
import com.dayflow.hrms.service.EmployeeProfileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_HR_ADMIN')")
public class AdminEmployeeController {

    private final EmployeeProfileService profileService;
    private final AuditLogService auditLogService;

    public AdminEmployeeController(EmployeeProfileService profileService, AuditLogService auditLogService) {
        this.profileService = profileService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<EmployeeProfileDto>>> getAllEmployees(@RequestParam(value = "department", required = false) String department) {
        List<EmployeeProfileDto> employees = profileService.getAllEmployees(department);
        return ResponseEntity.ok(ApiResponse.ok("Employee list retrieved", employees));
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeProfileDto>> getEmployeeById(@PathVariable("id") Long id) {
        EmployeeProfileDto employee = profileService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.ok("Employee details retrieved", employee));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeProfileDto>> adminOverrideProfile(@PathVariable("id") Long id,
                                                                               @RequestBody AdminOverrideProfileRequest request,
                                                                               @AuthenticationPrincipal UserPrincipal adminUser,
                                                                               HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        EmployeeProfileDto updated = profileService.adminOverrideProfile(id, request, adminUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Employee profile updated by Admin", updated));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        List<AuditLog> logs = auditLogService.getAllAuditLogs();
        return ResponseEntity.ok(ApiResponse.ok("Audit logs retrieved", logs));
    }
}
