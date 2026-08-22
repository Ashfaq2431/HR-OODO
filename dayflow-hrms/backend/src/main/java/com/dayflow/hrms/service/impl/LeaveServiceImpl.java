package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.leave.*;
import com.dayflow.hrms.entity.AttendanceRecord;
import com.dayflow.hrms.entity.EmployeeProfile;
import com.dayflow.hrms.entity.LeaveRequest;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.AttendanceStatus;
import com.dayflow.hrms.enums.LeaveStatus;
import com.dayflow.hrms.enums.NotificationType;
import com.dayflow.hrms.exception.BadRequestException;
import com.dayflow.hrms.exception.ResourceNotFoundException;
import com.dayflow.hrms.repository.AttendanceRecordRepository;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.LeaveRequestRepository;
import com.dayflow.hrms.repository.UserRepository;
import com.dayflow.hrms.service.AuditLogService;
import com.dayflow.hrms.service.EmailNotificationService;
import com.dayflow.hrms.service.LeaveService;
import com.dayflow.hrms.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final EmailNotificationService emailService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public LeaveServiceImpl(LeaveRequestRepository leaveRequestRepository,
                            UserRepository userRepository,
                            EmployeeProfileRepository employeeProfileRepository,
                            AttendanceRecordRepository attendanceRepository,
                            EmailNotificationService emailService,
                            NotificationService notificationService,
                            AuditLogService auditLogService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.userRepository = userRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.attendanceRepository = attendanceRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public LeaveDto applyLeave(Long userId, LeaveApplicationRequest request, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        EmployeeProfile profile = employeeProfileRepository.findByUser(user).orElse(null);
        String employeeName = profile != null ? profile.getFirstName() + " " + profile.getLastName() : user.getEmployeeId();

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date.");
        }

        // Validate if employee already checked in on a past or same-day date
        LocalDate today = LocalDate.now();
        if (request.getStartDate().isBefore(today)) {
            throw new BadRequestException("Cannot apply for retroactive leave for past dates.");
        }

        if (request.getStartDate().equals(today)) {
            Optional<AttendanceRecord> todayAtt = attendanceRepository.findByUserIdAndDate(userId, today);
            if (todayAtt.isPresent() && todayAtt.get().getCheckInTime() != null) {
                throw new BadRequestException("You have already checked in for work today. Cannot apply for full-day leave for today.");
            }
        }

        // Check for overlapping pending or approved leave requests
        List<LeaveRequest> overlaps = leaveRequestRepository.findOverlappingRequests(
                userId, request.getStartDate(), request.getEndDate(), null
        );

        if (!overlaps.isEmpty()) {
            throw new BadRequestException("You already have an active or pending leave request overlapping with this date range.");
        }

        LeaveRequest leave = new LeaveRequest(
                user,
                request.getLeaveType(),
                request.getStartDate(),
                request.getEndDate(),
                request.getReason().trim()
        );

        LeaveRequest saved = leaveRequestRepository.save(leave);

        // Send emails and notifications
        emailService.sendLeaveSubmittedEmail(
                user.getEmail(),
                employeeName,
                saved.getLeaveType().name(),
                saved.getStartDate().toString(),
                saved.getEndDate().toString()
        );

        notificationService.createNotification(
                userId,
                "Leave Application Submitted",
                "Your " + saved.getLeaveType() + " leave request for " + saved.getStartDate() + " to " + saved.getEndDate() + " is pending review.",
                NotificationType.LEAVE
        );

        notificationService.notifyAllAdmins(
                "New Leave Request",
                employeeName + " applied for " + saved.getLeaveType() + " leave (" + saved.getTotalDays() + " days: " + saved.getStartDate() + " to " + saved.getEndDate() + ")",
                NotificationType.LEAVE
        );

        auditLogService.logAction(
                userId,
                "LEAVE_APPLICATION_SUBMITTED",
                "LeaveRequest",
                saved.getId().toString(),
                null,
                "Type: " + saved.getLeaveType() + ", " + saved.getStartDate() + " to " + saved.getEndDate(),
                ipAddress
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public LeaveDto updatePendingLeave(Long leaveId, Long userId, LeaveUpdateRequest request, String ipAddress) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (!leave.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only edit your own leave requests.");
        }

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be edited directly. Approved leaves require a recall/early return request.");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date.");
        }

        // Check overlaps excluding current request
        List<LeaveRequest> overlaps = leaveRequestRepository.findOverlappingRequests(
                userId, request.getStartDate(), request.getEndDate(), leaveId
        );

        if (!overlaps.isEmpty()) {
            throw new BadRequestException("The updated date range overlaps with another existing leave request.");
        }

        String oldDetails = leave.getStartDate() + " to " + leave.getEndDate() + " (" + leave.getLeaveType() + ")";

        if (request.getLeaveType() != null) leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        if (request.getReason() != null && !request.getReason().isBlank()) {
            leave.setReason(request.getReason().trim());
        }
        leave.calculateTotalDays();

        LeaveRequest saved = leaveRequestRepository.save(leave);

        auditLogService.logAction(
                userId,
                "LEAVE_APPLICATION_UPDATED",
                "LeaveRequest",
                saved.getId().toString(),
                oldDetails,
                saved.getStartDate() + " to " + saved.getEndDate() + " (" + saved.getLeaveType() + ")",
                ipAddress
        );

        notificationService.createNotification(
                userId,
                "Leave Application Updated",
                "Your leave request has been updated to " + saved.getStartDate() + " to " + saved.getEndDate(),
                NotificationType.LEAVE
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public LeaveDto withdrawPendingLeave(Long leaveId, Long userId, String ipAddress) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (!leave.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only withdraw your own leave requests.");
        }

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be withdrawn directly.");
        }

        leave.setStatus(LeaveStatus.WITHDRAWN);
        LeaveRequest saved = leaveRequestRepository.save(leave);

        auditLogService.logAction(
                userId,
                "LEAVE_APPLICATION_WITHDRAWN",
                "LeaveRequest",
                saved.getId().toString(),
                "PENDING",
                "WITHDRAWN",
                ipAddress
        );

        notificationService.createNotification(
                userId,
                "Leave Request Withdrawn",
                "You have successfully withdrawn your leave request for " + saved.getStartDate() + " to " + saved.getEndDate(),
                NotificationType.LEAVE
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public LeaveDto approveLeave(Long leaveId, LeaveReviewRequest request, Long adminUserId, String ipAddress) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is not in PENDING state (Current status: " + leave.getStatus() + ")");
        }

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovedAt(LocalDateTime.now());
        if (request != null && request.getHrComments() != null) {
            leave.setHrComments(request.getHrComments().trim());
        }

        LeaveRequest saved = leaveRequestRepository.save(leave);

// Update attendance records for each date in the range to LEAVE
LocalDate curr = saved.getStartDate();
while (!curr.isAfter(saved.getEndDate())) {
    Optional<AttendanceRecord> attOpt = attendanceRepository.findByUserIdAndDate(saved.getUser().getId(), curr);
    AttendanceRecord att;
    if (attOpt.isPresent()) {
        att = attOpt.get();
    } else {
        att = new AttendanceRecord();
        att.setUser(saved.getUser());
        att.setDate(curr); // ✅ WORKS PERFECTLY (No lambda)
    }
    att.setStatus(AttendanceStatus.LEAVE);
    att.setRemarks("Approved " + saved.getLeaveType() + " Leave");
    attendanceRepository.save(att);
    curr = curr.plusDays(1); // ✅ Increments normally each day
}

        EmployeeProfile profile = employeeProfileRepository.findByUser(saved.getUser()).orElse(null);
        String employeeName = profile != null ? profile.getFirstName() + " " + profile.getLastName() : saved.getUser().getEmployeeId();

        // Send approval email & notification
        emailService.sendLeaveApprovalEmail(
                saved.getUser().getEmail(),
                employeeName,
                saved.getLeaveType().name(),
                saved.getStartDate().toString(),
                saved.getEndDate().toString(),
                saved.getHrComments()
        );

        notificationService.createNotification(
                saved.getUser().getId(),
                "Leave Approved!",
                "Your " + saved.getLeaveType() + " leave request for " + saved.getStartDate() + " to " + saved.getEndDate() + " has been approved.",
                NotificationType.LEAVE
        );

        auditLogService.logAction(
                adminUserId,
                "LEAVE_APPROVED",
                "LeaveRequest",
                saved.getId().toString(),
                "PENDING",
                "APPROVED (Comments: " + saved.getHrComments() + ")",
                ipAddress
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public LeaveDto rejectLeave(Long leaveId, LeaveReviewRequest request, Long adminUserId, String ipAddress) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is not in PENDING state (Current status: " + leave.getStatus() + ")");
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setRejectedAt(LocalDateTime.now());
        if (request != null && request.getHrComments() != null) {
            leave.setHrComments(request.getHrComments().trim());
        }

        LeaveRequest saved = leaveRequestRepository.save(leave);

        EmployeeProfile profile = employeeProfileRepository.findByUser(saved.getUser()).orElse(null);
        String employeeName = profile != null ? profile.getFirstName() + " " + profile.getLastName() : saved.getUser().getEmployeeId();

        emailService.sendLeaveRejectionEmail(
                saved.getUser().getEmail(),
                employeeName,
                saved.getLeaveType().name(),
                saved.getStartDate().toString(),
                saved.getEndDate().toString(),
                saved.getHrComments()
        );

        notificationService.createNotification(
                saved.getUser().getId(),
                "Leave Request Rejected",
                "Your " + saved.getLeaveType() + " leave request for " + saved.getStartDate() + " to " + saved.getEndDate() + " was rejected.",
                NotificationType.LEAVE
        );

        auditLogService.logAction(
                adminUserId,
                "LEAVE_REJECTED",
                "LeaveRequest",
                saved.getId().toString(),
                "PENDING",
                "REJECTED (Comments: " + saved.getHrComments() + ")",
                ipAddress
        );

        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveDto> getMyLeaves(Long userId) {
        return leaveRequestRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveDto> getAllLeaves(LeaveStatus statusFilter) {
        List<LeaveRequest> list;
        if (statusFilter != null) {
            list = leaveRequestRepository.findByStatusOrderByCreatedAtAsc(statusFilter);
        } else {
            list = leaveRequestRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveDto getLeaveById(Long leaveId) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));
        return toDto(leave);
    }

    private LeaveDto toDto(LeaveRequest leave) {
        LeaveDto dto = new LeaveDto();
        dto.setId(leave.getId());
        dto.setUserId(leave.getUser().getId());
        dto.setEmployeeId(leave.getUser().getEmployeeId());
        dto.setLeaveType(leave.getLeaveType());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setTotalDays(leave.getTotalDays());
        dto.setReason(leave.getReason());
        dto.setStatus(leave.getStatus());
        dto.setHrComments(leave.getHrComments());
        dto.setApprovedAt(leave.getApprovedAt());
        dto.setRejectedAt(leave.getRejectedAt());
        dto.setCreatedAt(leave.getCreatedAt());
        dto.setUpdatedAt(leave.getUpdatedAt());

        EmployeeProfile profile = employeeProfileRepository.findByUser(leave.getUser()).orElse(null);
        if (profile != null) {
            dto.setEmployeeName(profile.getFirstName() + " " + profile.getLastName());
            dto.setDepartment(profile.getDepartment());
        }

        return dto;
    }
}
