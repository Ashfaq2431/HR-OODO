package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.leave.LeaveDto;
import com.dayflow.hrms.dto.leave.LeaveReviewRequest;
import com.dayflow.hrms.enums.LeaveStatus;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.LeaveService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/leaves")
@PreAuthorize("hasAuthority('ROLE_HR_ADMIN')")
public class AdminLeaveController {

    private final LeaveService leaveService;

    public AdminLeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveDto>>> getAllLeaves(@RequestParam(value = "status", required = false) LeaveStatus status) {
        List<LeaveDto> leaves = leaveService.getAllLeaves(status);
        return ResponseEntity.ok(ApiResponse.ok("Company leave requests retrieved", leaves));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveDto>> getLeaveById(@PathVariable("id") Long id) {
        LeaveDto leave = leaveService.getLeaveById(id);
        return ResponseEntity.ok(ApiResponse.ok("Leave request retrieved", leave));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LeaveDto>> approveLeave(@PathVariable("id") Long id,
                                                             @RequestBody(required = false) LeaveReviewRequest request,
                                                             @AuthenticationPrincipal UserPrincipal adminUser,
                                                             HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        LeaveDto approved = leaveService.approveLeave(id, request, adminUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Leave request approved successfully", approved));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<LeaveDto>> rejectLeave(@PathVariable("id") Long id,
                                                            @RequestBody(required = false) LeaveReviewRequest request,
                                                            @AuthenticationPrincipal UserPrincipal adminUser,
                                                            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        LeaveDto rejected = leaveService.rejectLeave(id, request, adminUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Leave request rejected", rejected));
    }
}
