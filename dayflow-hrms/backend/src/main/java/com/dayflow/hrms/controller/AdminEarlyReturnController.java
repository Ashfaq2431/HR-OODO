package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnRequestDto;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnReviewDto;
import com.dayflow.hrms.enums.EarlyReturnStatus;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.EarlyReturnService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/early-return")
@PreAuthorize("hasAuthority('ROLE_HR_ADMIN')")
public class AdminEarlyReturnController {

    private final EarlyReturnService earlyReturnService;

    public AdminEarlyReturnController(EarlyReturnService earlyReturnService) {
        this.earlyReturnService = earlyReturnService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EarlyReturnRequestDto>>> getAllEarlyReturnRequests(
            @RequestParam(value = "status", required = false) EarlyReturnStatus status) {

        List<EarlyReturnRequestDto> list = earlyReturnService.getAllEarlyReturnRequests(status);
        return ResponseEntity.ok(ApiResponse.ok("Early return requests retrieved", list));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<EarlyReturnRequestDto>> approveEarlyReturn(
            @PathVariable("id") Long id,
            @RequestBody(required = false) EarlyReturnReviewDto reviewDto,
            @AuthenticationPrincipal UserPrincipal adminUser,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        EarlyReturnRequestDto approved = earlyReturnService.approveEarlyReturn(id, reviewDto, adminUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Early return approved. Employee leave updated and check-in unblocked.", approved));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<EarlyReturnRequestDto>> rejectEarlyReturn(
            @PathVariable("id") Long id,
            @RequestBody(required = false) EarlyReturnReviewDto reviewDto,
            @AuthenticationPrincipal UserPrincipal adminUser,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        EarlyReturnRequestDto rejected = earlyReturnService.rejectEarlyReturn(id, reviewDto, adminUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Early return request rejected", rejected));
    }
}
