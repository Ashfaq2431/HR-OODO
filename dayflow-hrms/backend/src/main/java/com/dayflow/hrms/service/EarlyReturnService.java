package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.earlyreturn.EarlyReturnRequestDto;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnReviewDto;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnSubmitRequest;
import com.dayflow.hrms.enums.EarlyReturnStatus;

import java.util.List;

public interface EarlyReturnService {
    EarlyReturnRequestDto createEarlyReturnRequest(Long userId, EarlyReturnSubmitRequest request, String ipAddress);
    EarlyReturnRequestDto approveEarlyReturn(Long requestId, EarlyReturnReviewDto reviewDto, Long adminUserId, String ipAddress);
    EarlyReturnRequestDto rejectEarlyReturn(Long requestId, EarlyReturnReviewDto reviewDto, Long adminUserId, String ipAddress);
    List<EarlyReturnRequestDto> getMyEarlyReturnRequests(Long userId);
    List<EarlyReturnRequestDto> getAllEarlyReturnRequests(EarlyReturnStatus statusFilter);
}
