package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.attendance.*;
import com.dayflow.hrms.enums.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceDto checkIn(Long userId, CheckInRequest request, String ipAddress);
    AttendanceDto checkOut(Long userId, CheckOutRequest request, String ipAddress);
    DailyAttendanceSummaryDto getTodaySummary(Long userId);
    List<AttendanceDto> getMyAttendanceHistory(Long userId);
    List<AttendanceDto> getMyCalendarAttendance(Long userId, int year, int month);
    List<AttendanceDto> getGlobalAttendance(Long userIdFilter, LocalDate dateFilter, String departmentFilter, AttendanceStatus statusFilter);
    AttendanceDto manualAttendanceOverride(AttendanceOverrideRequest request, Long adminUserId, String ipAddress);
}
