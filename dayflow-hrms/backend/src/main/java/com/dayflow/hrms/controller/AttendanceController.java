package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.attendance.AttendanceDto;
import com.dayflow.hrms.dto.attendance.CheckInRequest;
import com.dayflow.hrms.dto.attendance.CheckOutRequest;
import com.dayflow.hrms.dto.attendance.DailyAttendanceSummaryDto;
import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceDto>> checkIn(@RequestBody(required = false) CheckInRequest request,
                                                              @AuthenticationPrincipal UserPrincipal currentUser,
                                                              HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AttendanceDto record = attendanceService.checkIn(currentUser.getId(), request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Checked in successfully", record));
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<AttendanceDto>> checkOut(@RequestBody(required = false) CheckOutRequest request,
                                                               @AuthenticationPrincipal UserPrincipal currentUser,
                                                               HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AttendanceDto record = attendanceService.checkOut(currentUser.getId(), request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Checked out successfully", record));
    }

    @GetMapping("/me/today")
    public ResponseEntity<ApiResponse<DailyAttendanceSummaryDto>> getTodaySummary(@AuthenticationPrincipal UserPrincipal currentUser) {
        DailyAttendanceSummaryDto summary = attendanceService.getTodaySummary(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Today's attendance summary retrieved", summary));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getMyAttendanceHistory(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<AttendanceDto> history = attendanceService.getMyAttendanceHistory(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Attendance history retrieved", history));
    }

    @GetMapping("/me/calendar")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getMyCalendarAttendance(@RequestParam(value = "year", required = false) Integer year,
                                                                                   @RequestParam(value = "month", required = false) Integer month,
                                                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        int targetMonth = (month != null) ? month : LocalDate.now().getMonthValue();

        List<AttendanceDto> calendar = attendanceService.getMyCalendarAttendance(currentUser.getId(), targetYear, targetMonth);
        return ResponseEntity.ok(ApiResponse.ok("Calendar attendance retrieved", calendar));
    }
}
