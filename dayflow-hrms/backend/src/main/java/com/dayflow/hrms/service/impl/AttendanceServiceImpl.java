package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.attendance.*;
import com.dayflow.hrms.entity.AttendanceRecord;
import com.dayflow.hrms.entity.EmployeeProfile;
import com.dayflow.hrms.entity.LeaveRequest;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.AttendanceStatus;
import com.dayflow.hrms.enums.NotificationType;
import com.dayflow.hrms.exception.AttendanceException;
import com.dayflow.hrms.exception.ResourceNotFoundException;
import com.dayflow.hrms.repository.AttendanceRecordRepository;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.LeaveRequestRepository;
import com.dayflow.hrms.repository.UserRepository;
import com.dayflow.hrms.service.AttendanceService;
import com.dayflow.hrms.service.AuditLogService;
import com.dayflow.hrms.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public AttendanceServiceImpl(AttendanceRecordRepository attendanceRepository,
                                 UserRepository userRepository,
                                 EmployeeProfileRepository employeeProfileRepository,
                                 LeaveRequestRepository leaveRequestRepository,
                                 NotificationService notificationService,
                                 AuditLogService auditLogService) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public AttendanceDto checkIn(Long userId, CheckInRequest request, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 1. Check if employee is on APPROVED leave today
        Optional<LeaveRequest> approvedLeave = leaveRequestRepository.findApprovedLeaveForDate(userId, today);
        if (approvedLeave.isPresent()) {
            throw new AttendanceException(
                    "You are currently on approved leave for today. Do you want to request an early return and check in?",
                    "APPROVED_LEAVE_CONFLICT",
                    approvedLeave.get().getId()
            );
        }

        // 2. Check if already checked in today
        Optional<AttendanceRecord> existingOpt = attendanceRepository.findByUserIdAndDate(userId, today);
        if (existingOpt.isPresent() && existingOpt.get().getCheckInTime() != null) {
            throw new AttendanceException("You have already checked in for today at " + existingOpt.get().getCheckInTime(), "ALREADY_CHECKED_IN");
        }

        AttendanceRecord record = existingOpt.orElseGet(() -> new AttendanceRecord(user, today, now, AttendanceStatus.PRESENT));
        record.setUser(user);
        record.setDate(today);
        record.setCheckInTime(now);
        record.setStatus(AttendanceStatus.PRESENT);
        if (request != null && request.getRemarks() != null) {
            record.setRemarks(request.getRemarks());
        }

        AttendanceRecord saved = attendanceRepository.save(record);

        auditLogService.logAction(
                userId,
                "ATTENDANCE_CHECK_IN",
                "AttendanceRecord",
                saved.getId().toString(),
                null,
                "Checked in at " + now,
                ipAddress
        );

        notificationService.createNotification(
                userId,
                "Check-In Successful",
                "You checked in at " + now.withNano(0) + " on " + today,
                NotificationType.ATTENDANCE
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public AttendanceDto checkOut(Long userId, CheckOutRequest request, String ipAddress) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        AttendanceRecord record = attendanceRepository.findByUserIdAndDate(userId, today)
                .orElseThrow(() -> new AttendanceException("No check-in record found for today. Please check in first.", "NO_ACTIVE_CHECKIN"));

        if (record.getCheckInTime() == null) {
            throw new AttendanceException("No check-in recorded for today. Cannot check out.", "NO_ACTIVE_CHECKIN");
        }

        if (record.getCheckOutTime() != null) {
            throw new AttendanceException("You have already checked out for today at " + record.getCheckOutTime(), "ALREADY_CHECKED_OUT");
        }

        record.setCheckOutTime(now);
        record.calculateWorkedHours();

        if (request != null && request.getRemarks() != null && !request.getRemarks().isBlank()) {
            String updatedRemarks = (record.getRemarks() != null ? record.getRemarks() + " | " : "") + request.getRemarks();
            record.setRemarks(updatedRemarks);
        }

        AttendanceRecord saved = attendanceRepository.save(record);

        auditLogService.logAction(
                userId,
                "ATTENDANCE_CHECK_OUT",
                "AttendanceRecord",
                saved.getId().toString(),
                "In: " + saved.getCheckInTime(),
                "Out: " + now + ", Hours: " + saved.getTotalWorkedHours(),
                ipAddress
        );

        notificationService.createNotification(
                userId,
                "Check-Out Successful",
                "You checked out at " + now.withNano(0) + ". Total hours worked: " + saved.getTotalWorkedHours() + "h",
                NotificationType.ATTENDANCE
        );

        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyAttendanceSummaryDto getTodaySummary(Long userId) {
        LocalDate today = LocalDate.now();
        DailyAttendanceSummaryDto summary = new DailyAttendanceSummaryDto();
        summary.setTodayDate(today);

        Optional<AttendanceRecord> recordOpt = attendanceRepository.findByUserIdAndDate(userId, today);
        if (recordOpt.isPresent()) {
            AttendanceRecord record = recordOpt.get();
            summary.setStatus(record.getStatus().name());
            summary.setCheckInTime(record.getCheckInTime());
            summary.setCheckOutTime(record.getCheckOutTime());
            summary.setWorkedHours(record.getTotalWorkedHours());
            summary.setCheckedIn(record.getCheckInTime() != null);
            summary.setCheckedOut(record.getCheckOutTime() != null);
        } else {
            summary.setStatus("ABSENT");
            summary.setCheckedIn(false);
            summary.setCheckedOut(false);
        }

        Optional<LeaveRequest> approvedLeave = leaveRequestRepository.findApprovedLeaveForDate(userId, today);
        if (approvedLeave.isPresent()) {
            summary.setOnApprovedLeave(true);
            summary.setActiveLeaveRequestId(approvedLeave.get().getId());
        } else {
            summary.setOnApprovedLeave(false);
        }

        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDto> getMyAttendanceHistory(Long userId) {
        return attendanceRepository.findByUserIdOrderByDateDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDto> getMyCalendarAttendance(Long userId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        return attendanceRepository.findByUserIdAndDateBetweenOrderByDateAsc(userId, start, end)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDto> getGlobalAttendance(Long userIdFilter, LocalDate dateFilter, String departmentFilter, AttendanceStatus statusFilter) {
        List<AttendanceRecord> records = attendanceRepository.findWithFilters(userIdFilter, dateFilter, statusFilter);

        if (departmentFilter != null && !departmentFilter.isBlank() && !departmentFilter.equalsIgnoreCase("ALL")) {
            return records.stream()
                    .filter(r -> {
                        EmployeeProfile profile = employeeProfileRepository.findByUser(r.getUser()).orElse(null);
                        return profile != null && departmentFilter.equalsIgnoreCase(profile.getDepartment());
                    })
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        return records.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttendanceDto manualAttendanceOverride(AttendanceOverrideRequest request, Long adminUserId, String ipAddress) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + adminUserId));

        AttendanceRecord record = attendanceRepository.findByUserIdAndDate(request.getUserId(), request.getDate())
                .orElseGet(() -> {
                    AttendanceRecord newRec = new AttendanceRecord();
                    newRec.setUser(user);
                    newRec.setDate(request.getDate());
                    return newRec;
                });

        String oldDetails = "Status: " + record.getStatus() + ", In: " + record.getCheckInTime() + ", Out: " + record.getCheckOutTime();

        record.setCheckInTime(request.getCheckInTime());
        record.setCheckOutTime(request.getCheckOutTime());
        record.setStatus(request.getStatus());
        record.setRemarks(request.getRemarks());
        record.setManuallyOverridden(true);
        record.setOverrideReason(request.getOverrideReason());
        record.setOverriddenBy(admin.getEmail());
        record.setOverriddenAt(LocalDateTime.now());
        record.calculateWorkedHours();

        AttendanceRecord saved = attendanceRepository.save(record);

        String newDetails = "Status: " + saved.getStatus() + ", In: " + saved.getCheckInTime() + ", Out: " + saved.getCheckOutTime() + ", Reason: " + request.getOverrideReason();

        auditLogService.logAction(
                adminUserId,
                "MANUAL_ATTENDANCE_OVERRIDE",
                "AttendanceRecord",
                saved.getId().toString(),
                oldDetails,
                newDetails,
                ipAddress
        );

        notificationService.createNotification(
                user.getId(),
                "Attendance Record Adjusted",
                "An administrator manually adjusted your attendance record for " + request.getDate() + " (Reason: " + request.getOverrideReason() + ")",
                NotificationType.ATTENDANCE
        );

        return toDto(saved);
    }

    private AttendanceDto toDto(AttendanceRecord record) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(record.getId());
        dto.setUserId(record.getUser().getId());
        dto.setEmployeeId(record.getUser().getEmployeeId());
        dto.setDate(record.getDate());
        dto.setCheckInTime(record.getCheckInTime());
        dto.setCheckOutTime(record.getCheckOutTime());
        dto.setTotalWorkedHours(record.getTotalWorkedHours());
        dto.setStatus(record.getStatus());
        dto.setRemarks(record.getRemarks());
        dto.setManuallyOverridden(record.isManuallyOverridden());
        dto.setOverrideReason(record.getOverrideReason());
        dto.setOverriddenBy(record.getOverriddenBy());
        dto.setOverriddenAt(record.getOverriddenAt());
        dto.setCreatedAt(record.getCreatedAt());
        dto.setUpdatedAt(record.getUpdatedAt());

        EmployeeProfile profile = employeeProfileRepository.findByUser(record.getUser()).orElse(null);
        if (profile != null) {
            dto.setEmployeeName(profile.getFirstName() + " " + profile.getLastName());
            dto.setDepartment(profile.getDepartment());
        }

        return dto;
    }
}
