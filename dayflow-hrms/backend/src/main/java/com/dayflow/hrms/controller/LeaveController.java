package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.leave.LeaveApplicationRequest;
import com.dayflow.hrms.dto.leave.LeaveDto;
import com.dayflow.hrms.dto.leave.LeaveUpdateRequest;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.LeaveService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveDto>> applyLeave(@Valid @RequestBody LeaveApplicationRequest request,
                                                           @AuthenticationPrincipal UserPrincipal currentUser,
                                                           HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        LeaveDto leave = leaveService.applyLeave(currentUser.getId(), request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Leave request submitted successfully", leave));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<LeaveDto>>> getMyLeaves(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<LeaveDto> leaves = leaveService.getMyLeaves(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Leave requests retrieved", leaves));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveDto>> getLeaveById(@PathVariable("id") Long id) {
        LeaveDto leave = leaveService.getLeaveById(id);
        return ResponseEntity.ok(ApiResponse.ok("Leave request retrieved", leave));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveDto>> updatePendingLeave(@PathVariable("id") Long id,
                                                                   @Valid @RequestBody LeaveUpdateRequest request,
                                                                   @AuthenticationPrincipal UserPrincipal currentUser,
                                                                   HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        LeaveDto updated = leaveService.updatePendingLeave(id, currentUser.getId(), request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Leave request updated successfully", updated));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<ApiResponse<LeaveDto>> withdrawPendingLeave(@PathVariable("id") Long id,
                                                                     @AuthenticationPrincipal UserPrincipal currentUser,
                                                                     HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        LeaveDto withdrawn = leaveService.withdrawPendingLeave(id, currentUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Leave request withdrawn successfully", withdrawn));
    }
}
