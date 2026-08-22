package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnRequestDto;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnSubmitRequest;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.EarlyReturnService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/early-return")
public class EarlyReturnController {

    private final EarlyReturnService earlyReturnService;

    public EarlyReturnController(EarlyReturnService earlyReturnService) {
        this.earlyReturnService = earlyReturnService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EarlyReturnRequestDto>> submitEarlyReturn(
            @Valid @RequestBody EarlyReturnSubmitRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        EarlyReturnRequestDto dto = earlyReturnService.createEarlyReturnRequest(currentUser.getId(), request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Early return request submitted to HR for approval", dto));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<EarlyReturnRequestDto>>> getMyEarlyReturnRequests(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<EarlyReturnRequestDto> list = earlyReturnService.getMyEarlyReturnRequests(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Early return requests retrieved", list));
    }
}
