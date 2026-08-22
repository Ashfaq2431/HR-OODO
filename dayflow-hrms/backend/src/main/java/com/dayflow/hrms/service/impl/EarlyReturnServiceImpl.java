package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.earlyreturn.EarlyReturnRequestDto;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnReviewDto;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnSubmitRequest;
import com.dayflow.hrms.entity.AttendanceRecord;
import com.dayflow.hrms.entity.EarlyReturnRequest;
import com.dayflow.hrms.entity.EmployeeProfile;
import com.dayflow.hrms.entity.LeaveRequest;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.AttendanceStatus;
import com.dayflow.hrms.enums.EarlyReturnStatus;
import com.dayflow.hrms.enums.LeaveStatus;
import com.dayflow.hrms.enums.NotificationType;
import com.dayflow.hrms.exception.BadRequestException;
import com.dayflow.hrms.exception.ResourceNotFoundException;
import com.dayflow.hrms.repository.AttendanceRecordRepository;
import com.dayflow.hrms.repository.EarlyReturnRequestRepository;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.LeaveRequestRepository;
import com.dayflow.hrms.repository.UserRepository;
import com.dayflow.hrms.service.AuditLogService;
import com.dayflow.hrms.service.EarlyReturnService;
import com.dayflow.hrms.service.EmailNotificationService;
import com.dayflow.hrms.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EarlyReturnServiceImpl implements EarlyReturnService {

    private final EarlyReturnRequestRepository earlyReturnRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final EmailNotificationService emailService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public EarlyReturnServiceImpl(EarlyReturnRequestRepository earlyReturnRepository,
                                  LeaveRequestRepository leaveRequestRepository,
                                  UserRepository userRepository,
                                  EmployeeProfileRepository employeeProfileRepository,
                                  AttendanceRecordRepository attendanceRepository,
                                  EmailNotificationService emailService,
                                  NotificationService notificationService,
                                  AuditLogService auditLogService) {
        this.earlyReturnRepository = earlyReturnRepository;
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
    public EarlyReturnRequestDto createEarlyReturnRequest(Long userId, EarlyReturnSubmitRequest request, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        LeaveRequest leave = leaveRequestRepository.findById(request.getLeaveRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + request.getLeaveRequestId()));

        if (!leave.getUser().getId().equals(userId)) {
            throw new BadRequestException("Leave request does not belong to the user.");
        }

        if (leave.getStatus() != LeaveStatus.APPROVED) {
            throw new BadRequestException("Early return can only be requested for APPROVED leaves.");
        }

        if (request.getRequestDate().isBefore(leave.getStartDate()) || request.getRequestDate().isAfter(leave.getEndDate())) {
            throw new BadRequestException("Requested return date " + request.getRequestDate() + " is outside the leave period (" + leave.getStartDate() + " to " + leave.getEndDate() + ").");
        }

        // Check if there is already a pending early return for this date
        Optional<EarlyReturnRequest> existingPending = earlyReturnRepository.findByUserIdAndRequestDateAndStatus(
                userId, request.getRequestDate(), EarlyReturnStatus.PENDING
        );
        if (existingPending.isPresent()) {
            throw new BadRequestException("An early return request is already pending for " + request.getRequestDate());
        }

        EarlyReturnRequest earlyReturn = new EarlyReturnRequest(
                user,
                leave,
                request.getRequestDate(),
                request.getReason().trim()
        );

        EarlyReturnRequest saved = earlyReturnRepository.save(earlyReturn);

        EmployeeProfile profile = employeeProfileRepository.findByUser(user).orElse(null);
        String employeeName = profile != null ? profile.getFirstName() + " " + profile.getLastName() : user.getEmployeeId();

        // Notify HR and User
        emailService.sendEarlyReturnRequestEmail(
                "hr@dayflow.com",
                employeeName,
                saved.getRequestDate().toString(),
                saved.getReason()
        );

        notificationService.createNotification(
                userId,
                "Early Return Requested",
                "Your early return request for " + saved.getRequestDate() + " has been submitted to HR for approval.",
                NotificationType.LEAVE
        );

        notificationService.notifyAllAdmins(
                "Early Return Request Pending",
                employeeName + " requested an early return from leave for date " + saved.getRequestDate() + " (Reason: " + saved.getReason() + ")",
                NotificationType.LEAVE
        );

        auditLogService.logAction(
                userId,
                "EARLY_RETURN_REQUEST_CREATED",
                "EarlyReturnRequest",
                saved.getId().toString(),
                null,
                "Date: " + saved.getRequestDate() + ", Leave ID: " + leave.getId(),
                ipAddress
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public EarlyReturnRequestDto approveEarlyReturn(Long requestId, EarlyReturnReviewDto reviewDto, Long adminUserId, String ipAddress) {
        EarlyReturnRequest earlyReturn = earlyReturnRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Early return request not found with id: " + requestId));

        if (earlyReturn.getStatus() != EarlyReturnStatus.PENDING) {
            throw new BadRequestException("Early return request is already " + earlyReturn.getStatus());
        }

        earlyReturn.setStatus(EarlyReturnStatus.APPROVED);
        earlyReturn.setReviewedAt(LocalDateTime.now());
        if (reviewDto != null && reviewDto.getHrComments() != null) {
            earlyReturn.setHrComments(reviewDto.getHrComments().trim());
        }

        EarlyReturnRequest saved = earlyReturnRepository.save(earlyReturn);
        LeaveRequest leave = saved.getLeaveRequest();
        LocalDate returnDate = saved.getRequestDate();

        // Adjust leave record
        if (leave.getStartDate().equals(leave.getEndDate()) && leave.getStartDate().equals(returnDate)) {
            // Single day leave fully recalled
            leave.setStatus(LeaveStatus.RECALLED);
            leave.setHrComments("Early return approved. Single-day leave recalled.");
        } else if (returnDate.equals(leave.getStartDate())) {
            // First day returned -> adjust start date to next day
            leave.setStartDate(returnDate.plusDays(1));
            leave.calculateTotalDays();
        } else if (returnDate.equals(leave.getEndDate())) {
            // Last day returned -> adjust end date to previous day
            leave.setEndDate(returnDate.minusDays(1));
            leave.calculateTotalDays();
        } else {
            // Mid-period early return -> end leave on previous day
            leave.setEndDate(returnDate.minusDays(1));
            leave.calculateTotalDays();
        }

        leaveRequestRepository.save(leave);

        // Adjust attendance record for the return date: Remove LEAVE status so employee can check in
        Optional<AttendanceRecord> attOpt = attendanceRepository.findByUserIdAndDate(saved.getUser().getId(), returnDate);
        if (attOpt.isPresent()) {
            AttendanceRecord att = attOpt.get();
            if (att.getStatus() == AttendanceStatus.LEAVE) {
                att.setStatus(AttendanceStatus.ABSENT); // unblocks check-in; when user checks in, becomes PRESENT
                att.setRemarks("Early return approved. Awaiting check-in.");
                attendanceRepository.save(att);
            }
        }

        EmployeeProfile profile = employeeProfileRepository.findByUser(saved.getUser()).orElse(null);
        String employeeName = profile != null ? profile.getFirstName() + " " + profile.getLastName() : saved.getUser().getEmployeeId();

        // Notify employee
        emailService.sendEarlyReturnApprovalEmail(
                saved.getUser().getEmail(),
                employeeName,
                returnDate.toString(),
                saved.getHrComments()
        );

        notificationService.createNotification(
                saved.getUser().getId(),
                "Early Return Approved!",
                "Your early return request for " + returnDate + " was approved. You can now check in to work.",
                NotificationType.LEAVE
        );

        auditLogService.logAction(
                adminUserId,
                "EARLY_RETURN_APPROVED",
                "EarlyReturnRequest",
                saved.getId().toString(),
                "PENDING",
                "APPROVED for date " + returnDate,
                ipAddress
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public EarlyReturnRequestDto rejectEarlyReturn(Long requestId, EarlyReturnReviewDto reviewDto, Long adminUserId, String ipAddress) {
        EarlyReturnRequest earlyReturn = earlyReturnRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Early return request not found with id: " + requestId));

        if (earlyReturn.getStatus() != EarlyReturnStatus.PENDING) {
            throw new BadRequestException("Early return request is already " + earlyReturn.getStatus());
        }

        earlyReturn.setStatus(EarlyReturnStatus.REJECTED);
        earlyReturn.setReviewedAt(LocalDateTime.now());
        if (reviewDto != null && reviewDto.getHrComments() != null) {
            earlyReturn.setHrComments(reviewDto.getHrComments().trim());
        }

        EarlyReturnRequest saved = earlyReturnRepository.save(earlyReturn);

        EmployeeProfile profile = employeeProfileRepository.findByUser(saved.getUser()).orElse(null);
        String employeeName = profile != null ? profile.getFirstName() + " " + profile.getLastName() : saved.getUser().getEmployeeId();

        emailService.sendEarlyReturnRejectionEmail(
                saved.getUser().getEmail(),
                employeeName,
                saved.getRequestDate().toString(),
                saved.getHrComments()
        );

        notificationService.createNotification(
                saved.getUser().getId(),
                "Early Return Rejected",
                "Your early return request for " + saved.getRequestDate() + " was rejected by HR. Original leave remains in effect.",
                NotificationType.LEAVE
        );

        auditLogService.logAction(
                adminUserId,
                "EARLY_RETURN_REJECTED",
                "EarlyReturnRequest",
                saved.getId().toString(),
                "PENDING",
                "REJECTED for date " + saved.getRequestDate(),
                ipAddress
        );

        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EarlyReturnRequestDto> getMyEarlyReturnRequests(Long userId) {
        return earlyReturnRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EarlyReturnRequestDto> getAllEarlyReturnRequests(EarlyReturnStatus statusFilter) {
        List<EarlyReturnRequest> list;
        if (statusFilter != null) {
            list = earlyReturnRepository.findByStatusOrderByCreatedAtAsc(statusFilter);
        } else {
            list = earlyReturnRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private EarlyReturnRequestDto toDto(EarlyReturnRequest req) {
        EarlyReturnRequestDto dto = new EarlyReturnRequestDto();
        dto.setId(req.getId());
        dto.setUserId(req.getUser().getId());
        dto.setEmployeeId(req.getUser().getEmployeeId());
        dto.setLeaveRequestId(req.getLeaveRequest().getId());
        dto.setRequestDate(req.getRequestDate());
        dto.setReason(req.getReason());
        dto.setStatus(req.getStatus());
        dto.setHrComments(req.getHrComments());
        dto.setReviewedAt(req.getReviewedAt());
        dto.setCreatedAt(req.getCreatedAt());

        EmployeeProfile profile = employeeProfileRepository.findByUser(req.getUser()).orElse(null);
        if (profile != null) {
            dto.setEmployeeName(profile.getFirstName() + " " + profile.getLastName());
            dto.setDepartment(profile.getDepartment());
        }

        return dto;
    }
}
