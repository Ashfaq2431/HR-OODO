package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.attendance.AttendanceDto;
import com.dayflow.hrms.dto.attendance.CheckInRequest;
import com.dayflow.hrms.dto.attendance.CheckOutRequest;
import com.dayflow.hrms.entity.AttendanceRecord;
import com.dayflow.hrms.entity.LeaveRequest;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.AttendanceStatus;
import com.dayflow.hrms.enums.RoleType;
import com.dayflow.hrms.exception.AttendanceException;
import com.dayflow.hrms.repository.AttendanceRecordRepository;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.LeaveRequestRepository;
import com.dayflow.hrms.repository.UserRepository;
import com.dayflow.hrms.service.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRecordRepository attendanceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EmployeeProfileRepository employeeProfileRepository;
    @Mock
    private LeaveRequestRepository leaveRequestRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("EMP-TEST-001", "test@dayflow.com", "hash", RoleType.ROLE_EMPLOYEE);
        testUser.setId(10L);
    }

    @Test
    @DisplayName("Check-In: Blocks check-in if user has approved leave for today")
    void testCheckIn_BlocksWhenApprovedLeaveExists() {
        LocalDate today = LocalDate.now();
        LeaveRequest approvedLeave = new LeaveRequest();
        approvedLeave.setId(99L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
        when(leaveRequestRepository.findApprovedLeaveForDate(10L, today)).thenReturn(Optional.of(approvedLeave));

        AttendanceException exception = assertThrows(AttendanceException.class, () -> {
            attendanceService.checkIn(10L, new CheckInRequest("Morning check-in"), "127.0.0.1");
        });

        assertEquals("APPROVED_LEAVE_CONFLICT", exception.getErrorCode());
        assertEquals(99L, exception.getLeaveRequestId());
    }

    @Test
    @DisplayName("Check-In: Successful check-in when no leave conflict")
    void testCheckIn_Successful() {
        LocalDate today = LocalDate.now();
        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
        when(leaveRequestRepository.findApprovedLeaveForDate(10L, today)).thenReturn(Optional.empty());
        when(attendanceRepository.findByUserIdAndDate(10L, today)).thenReturn(Optional.empty());

        AttendanceRecord record = new AttendanceRecord(testUser, today, LocalTime.now(), AttendanceStatus.PRESENT);
        record.setId(1L);
        when(attendanceRepository.save(any(AttendanceRecord.class))).thenReturn(record);

        AttendanceDto result = attendanceService.checkIn(10L, new CheckInRequest("On time"), "127.0.0.1");

        assertNotNull(result);
        assertEquals(AttendanceStatus.PRESENT, result.getStatus());
        verify(attendanceRepository, times(1)).save(any(AttendanceRecord.class));
    }

    @Test
    @DisplayName("Check-Out: Throws exception if not checked in yet")
    void testCheckOut_ThrowsIfNoCheckIn() {
        LocalDate today = LocalDate.now();
        when(attendanceRepository.findByUserIdAndDate(10L, today)).thenReturn(Optional.empty());

        AttendanceException ex = assertThrows(AttendanceException.class, () -> {
            attendanceService.checkOut(10L, new CheckOutRequest("Leaving early"), "127.0.0.1");
        });

        assertEquals("NO_ACTIVE_CHECKIN", ex.getErrorCode());
    }
}
