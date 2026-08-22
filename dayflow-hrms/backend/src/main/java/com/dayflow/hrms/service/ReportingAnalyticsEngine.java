package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.payroll.PayslipDto;
import com.dayflow.hrms.dto.report.AttendanceComplianceReportDto;
import com.dayflow.hrms.dto.report.LeaveSummaryReportDto;
import com.dayflow.hrms.dto.report.PayrollReportDto;

public interface ReportingAnalyticsEngine {
    AttendanceComplianceReportDto generateAttendanceComplianceReport();
    LeaveSummaryReportDto generateLeaveSummaryReport();
    PayrollReportDto generatePayrollSummaryReport(String billingMonth);
    PayslipDto generateSalarySlip(Long userId, String billingMonth);
}
