package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.leave.*;
import com.dayflow.hrms.enums.LeaveStatus;

import java.util.List;

public interface LeaveService {
    LeaveDto applyLeave(Long userId, LeaveApplicationRequest request, String ipAddress);
    LeaveDto updatePendingLeave(Long leaveId, Long userId, LeaveUpdateRequest request, String ipAddress);
    LeaveDto withdrawPendingLeave(Long leaveId, Long userId, String ipAddress);
    LeaveDto approveLeave(Long leaveId, LeaveReviewRequest request, Long adminUserId, String ipAddress);
    LeaveDto rejectLeave(Long leaveId, LeaveReviewRequest request, Long adminUserId, String ipAddress);
    List<LeaveDto> getMyLeaves(Long userId);
    List<LeaveDto> getAllLeaves(LeaveStatus statusFilter);
    LeaveDto getLeaveById(Long leaveId);
}
