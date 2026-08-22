package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.attendance.AttendanceDto;
import com.dayflow.hrms.dto.attendance.AttendanceOverrideRequest;
import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.enums.AttendanceStatus;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/attendance")
@PreAuthorize("hasAuthority('ROLE_HR_ADMIN')")
public class AdminAttendanceController {

    private final AttendanceService attendanceService;

    public AdminAttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getGlobalAttendance(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "status", required = false) AttendanceStatus status) {

        List<AttendanceDto> records = attendanceService.getGlobalAttendance(userId, date, department, status);
        return ResponseEntity.ok(ApiResponse.ok("Company attendance records retrieved", records));
    }

    @PostMapping("/override")
    public ResponseEntity<ApiResponse<AttendanceDto>> manualAttendanceOverride(
            @Valid @RequestBody AttendanceOverrideRequest request,
            @AuthenticationPrincipal UserPrincipal adminUser,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        AttendanceDto updated = attendanceService.manualAttendanceOverride(request, adminUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Attendance manually adjusted successfully", updated));
    }
}
