package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.earlyreturn.EarlyReturnRequestDto;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnReviewDto;
import com.dayflow.hrms.dto.earlyreturn.EarlyReturnSubmitRequest;
import com.dayflow.hrms.entity.EarlyReturnRequest;
import com.dayflow.hrms.entity.LeaveRequest;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.EarlyReturnStatus;
import com.dayflow.hrms.enums.LeaveStatus;
import com.dayflow.hrms.enums.RoleType;
import com.dayflow.hrms.repository.*;
import com.dayflow.hrms.service.impl.EarlyReturnServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EarlyReturnServiceTest {

    @Mock
    private EarlyReturnRequestRepository earlyReturnRepository;
    @Mock
    private LeaveRequestRepository leaveRequestRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EmployeeProfileRepository employeeProfileRepository;
    @Mock
    private AttendanceRecordRepository attendanceRepository;
    @Mock
    private EmailNotificationService emailService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private EarlyReturnServiceImpl earlyReturnService;

    private User employee;
    private LeaveRequest approvedLeave;

    @BeforeEach
    void setUp() {
        employee = new User("EMP-TEST", "emp@dayflow.com", "hash", RoleType.ROLE_EMPLOYEE);
        employee.setId(5L);

        approvedLeave = new LeaveRequest();
        approvedLeave.setId(20L);
        approvedLeave.setUser(employee);
        approvedLeave.setStatus(LeaveStatus.APPROVED);
        approvedLeave.setStartDate(LocalDate.now());
        approvedLeave.setEndDate(LocalDate.now().plusDays(2));
    }

    @Test
    @DisplayName("Create Early Return Request successfully")
    void testCreateEarlyReturnRequest() {
        EarlyReturnSubmitRequest req = new EarlyReturnSubmitRequest();
        req.setLeaveRequestId(20L);
        req.setRequestDate(LocalDate.now());
        req.setReason("Urgent project release");

        when(userRepository.findById(5L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findById(20L)).thenReturn(Optional.of(approvedLeave));
        when(earlyReturnRepository.findByUserIdAndRequestDateAndStatus(5L, LocalDate.now(), EarlyReturnStatus.PENDING))
                .thenReturn(Optional.empty());

        EarlyReturnRequest saved = new EarlyReturnRequest(employee, approvedLeave, LocalDate.now(), req.getReason());
        saved.setId(100L);
        when(earlyReturnRepository.save(any(EarlyReturnRequest.class))).thenReturn(saved);

        EarlyReturnRequestDto dto = earlyReturnService.createEarlyReturnRequest(5L, req, "127.0.0.1");

        assertNotNull(dto);
        assertEquals(EarlyReturnStatus.PENDING, dto.getStatus());
        verify(emailService, times(1)).sendEarlyReturnRequestEmail(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Approve Early Return adjusts leave dates and unblocks attendance")
    void testApproveEarlyReturn() {
        EarlyReturnRequest req = new EarlyReturnRequest(employee, approvedLeave, LocalDate.now(), "Return today");
        req.setId(100L);
        req.setStatus(EarlyReturnStatus.PENDING);

        when(earlyReturnRepository.findById(100L)).thenReturn(Optional.of(req));
        when(earlyReturnRepository.save(any(EarlyReturnRequest.class))).thenReturn(req);
        when(attendanceRepository.findByUserIdAndDate(5L, LocalDate.now())).thenReturn(Optional.empty());

        EarlyReturnReviewDto review = new EarlyReturnReviewDto("Approved by HR");
        EarlyReturnRequestDto result = earlyReturnService.approveEarlyReturn(100L, review, 1L, "127.0.0.1");

        assertNotNull(result);
        assertEquals(EarlyReturnStatus.APPROVED, result.getStatus());
        verify(leaveRequestRepository, times(1)).save(approvedLeave);
    }
}
