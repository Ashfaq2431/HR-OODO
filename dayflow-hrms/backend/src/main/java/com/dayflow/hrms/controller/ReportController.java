package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.payroll.PayslipDto;
import com.dayflow.hrms.dto.report.AttendanceComplianceReportDto;
import com.dayflow.hrms.dto.report.LeaveSummaryReportDto;
import com.dayflow.hrms.dto.report.PayrollReportDto;
import com.dayflow.hrms.service.ReportingAnalyticsEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasAuthority('ROLE_HR_ADMIN')")
public class ReportController {

    private final ReportingAnalyticsEngine reportingEngine;

    public ReportController(ReportingAnalyticsEngine reportingEngine) {
        this.reportingEngine = reportingEngine;
    }

    @GetMapping("/attendance-compliance")
    public ResponseEntity<ApiResponse<AttendanceComplianceReportDto>> getAttendanceComplianceReport() {
        AttendanceComplianceReportDto report = reportingEngine.generateAttendanceComplianceReport();
        return ResponseEntity.ok(ApiResponse.ok("Attendance compliance report generated", report));
    }

    @GetMapping("/leave-summary")
    public ResponseEntity<ApiResponse<LeaveSummaryReportDto>> getLeaveSummaryReport() {
        LeaveSummaryReportDto report = reportingEngine.generateLeaveSummaryReport();
        return ResponseEntity.ok(ApiResponse.ok("Leave summary report generated", report));
    }

    @GetMapping("/payroll-summary")
    public ResponseEntity<ApiResponse<PayrollReportDto>> getPayrollSummaryReport(@RequestParam(value = "month", required = false) String month) {
        String targetMonth = (month != null && !month.isBlank()) ? month : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        PayrollReportDto report = reportingEngine.generatePayrollSummaryReport(targetMonth);
        return ResponseEntity.ok(ApiResponse.ok("Payroll summary report generated for " + targetMonth, report));
    }

    @GetMapping("/salary-slip")
    public ResponseEntity<ApiResponse<PayslipDto>> getSalarySlip(@RequestParam("userId") Long userId,
                                                                 @RequestParam("month") String month) {
        PayslipDto payslip = reportingEngine.generateSalarySlip(userId, month);
        return ResponseEntity.ok(ApiResponse.ok("Salary slip generated", payslip));
    }
}
