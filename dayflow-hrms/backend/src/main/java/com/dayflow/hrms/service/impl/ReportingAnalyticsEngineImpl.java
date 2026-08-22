package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.payroll.PayslipDto;
import com.dayflow.hrms.dto.report.AttendanceComplianceReportDto;
import com.dayflow.hrms.dto.report.LeaveSummaryReportDto;
import com.dayflow.hrms.dto.report.PayrollReportDto;
import com.dayflow.hrms.entity.AttendanceRecord;
import com.dayflow.hrms.entity.EmployeeProfile;
import com.dayflow.hrms.entity.LeaveRequest;
import com.dayflow.hrms.entity.PayrollLedger;
import com.dayflow.hrms.enums.AttendanceStatus;
import com.dayflow.hrms.enums.LeaveStatus;
import com.dayflow.hrms.enums.LeaveType;
import com.dayflow.hrms.enums.RoleType;
import com.dayflow.hrms.repository.*;
import com.dayflow.hrms.service.PayrollService;
import com.dayflow.hrms.service.ReportingAnalyticsEngine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportingAnalyticsEngineImpl implements ReportingAnalyticsEngine {

    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollLedgerRepository payrollLedgerRepository;
    private final PayrollService payrollService;

    public ReportingAnalyticsEngineImpl(UserRepository userRepository,
                                        EmployeeProfileRepository employeeProfileRepository,
                                        AttendanceRecordRepository attendanceRepository,
                                        LeaveRequestRepository leaveRequestRepository,
                                        PayrollLedgerRepository payrollLedgerRepository,
                                        PayrollService payrollService) {
        this.userRepository = userRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollLedgerRepository = payrollLedgerRepository;
        this.payrollService = payrollService;
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceComplianceReportDto generateAttendanceComplianceReport() {
        long totalEmployees = userRepository.findAll().stream()
                .filter(u -> u.getRole() == RoleType.ROLE_EMPLOYEE)
                .count();

        LocalDate today = LocalDate.now();
        List<AttendanceRecord> todayRecords = attendanceRepository.findByDate(today);

        long present = 0;
        long absent = 0;
        long halfDay = 0;
        long onLeave = 0;
        double totalWorkedHours = 0.0;
        int hoursCount = 0;

        Map<String, Long> deptPresentMap = new HashMap<>();

        for (AttendanceRecord record : todayRecords) {
            if (record.getStatus() == AttendanceStatus.PRESENT) {
                present++;
                if (record.getTotalWorkedHours() != null) {
                    totalWorkedHours += record.getTotalWorkedHours().doubleValue();
                    hoursCount++;
                }

                EmployeeProfile profile = employeeProfileRepository.findByUser(record.getUser()).orElse(null);
                String dept = profile != null && profile.getDepartment() != null ? profile.getDepartment() : "General";
                deptPresentMap.put(dept, deptPresentMap.getOrDefault(dept, 0L) + 1);
            } else if (record.getStatus() == AttendanceStatus.HALF_DAY) {
                halfDay++;
                if (record.getTotalWorkedHours() != null) {
                    totalWorkedHours += record.getTotalWorkedHours().doubleValue();
                    hoursCount++;
                }
            } else if (record.getStatus() == AttendanceStatus.LEAVE) {
                onLeave++;
            } else {
                absent++;
            }
        }

        // Implicit absentees: total employees - records found
        long recordedEmployees = todayRecords.size();
        if (totalEmployees > recordedEmployees) {
            absent += (totalEmployees - recordedEmployees);
        }

        double avgHours = hoursCount > 0 ? (Math.round((totalWorkedHours / hoursCount) * 100.0) / 100.0) : 0.0;
        double complianceRate = totalEmployees > 0 ? (Math.round(((double) (present + halfDay) / totalEmployees) * 10000.0) / 100.0) : 0.0;

        AttendanceComplianceReportDto dto = new AttendanceComplianceReportDto();
        dto.setTotalEmployees(totalEmployees);
        dto.setTotalPresentToday(present);
        dto.setTotalAbsentToday(absent);
        dto.setTotalHalfDayToday(halfDay);
        dto.setTotalOnLeaveToday(onLeave);
        dto.setAverageWorkingHours(avgHours);
        dto.setOverallComplianceRate(complianceRate);
        dto.setDepartmentAttendanceBreakdown(deptPresentMap);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveSummaryReportDto generateLeaveSummaryReport() {
        List<LeaveRequest> allLeaves = leaveRequestRepository.findAll();

        long pending = 0;
        long approved = 0;
        long rejected = 0;
        long withdrawn = 0;
        long paidCount = 0;
        long sickCount = 0;
        long unpaidCount = 0;

        Map<String, Long> deptLeaves = new HashMap<>();

        for (LeaveRequest leave : allLeaves) {
            if (leave.getStatus() == LeaveStatus.PENDING) pending++;
            else if (leave.getStatus() == LeaveStatus.APPROVED) {
                approved++;
                if (leave.getLeaveType() == LeaveType.PAID) paidCount += leave.getTotalDays();
                else if (leave.getLeaveType() == LeaveType.SICK) sickCount += leave.getTotalDays();
                else if (leave.getLeaveType() == LeaveType.UNPAID) unpaidCount += leave.getTotalDays();

                EmployeeProfile profile = employeeProfileRepository.findByUser(leave.getUser()).orElse(null);
                String dept = profile != null && profile.getDepartment() != null ? profile.getDepartment() : "General";
                deptLeaves.put(dept, deptLeaves.getOrDefault(dept, 0L) + leave.getTotalDays());
            } else if (leave.getStatus() == LeaveStatus.REJECTED) rejected++;
            else if (leave.getStatus() == LeaveStatus.WITHDRAWN) withdrawn++;
        }

        LeaveSummaryReportDto dto = new LeaveSummaryReportDto();
        dto.setTotalRequests(allLeaves.size());
        dto.setPendingRequests(pending);
        dto.setApprovedRequests(approved);
        dto.setRejectedRequests(rejected);
        dto.setWithdrawnRequests(withdrawn);
        dto.setPaidLeavesTaken(paidCount);
        dto.setSickLeavesTaken(sickCount);
        dto.setUnpaidLeavesTaken(unpaidCount);
        dto.setLeavesByDepartment(deptLeaves);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollReportDto generatePayrollSummaryReport(String billingMonth) {
        List<PayrollLedger> ledgers = payrollLedgerRepository.findByBillingMonth(billingMonth);

        BigDecimal grossPayout = BigDecimal.ZERO;
        BigDecimal taxDeducted = BigDecimal.ZERO;
        BigDecimal pfDeducted = BigDecimal.ZERO;
        BigDecimal lopDeductions = BigDecimal.ZERO;
        BigDecimal netDisbursement = BigDecimal.ZERO;
        Map<String, BigDecimal> deptCost = new HashMap<>();

        for (PayrollLedger l : ledgers) {
            grossPayout = grossPayout.add(l.getGrossPay());
            taxDeducted = taxDeducted.add(l.getTaxDeductions());
            pfDeducted = pfDeducted.add(l.getProvidentFund());
            lopDeductions = lopDeductions.add(l.getUnpaidLeaveDeductions());
            netDisbursement = netDisbursement.add(l.getTotalFinalSalary());

            EmployeeProfile profile = employeeProfileRepository.findByUser(l.getUser()).orElse(null);
            String dept = profile != null && profile.getDepartment() != null ? profile.getDepartment() : "General";
            BigDecimal curr = deptCost.getOrDefault(dept, BigDecimal.ZERO);
            deptCost.put(dept, curr.add(l.getTotalFinalSalary()));
        }

        PayrollReportDto dto = new PayrollReportDto();
        dto.setBillingMonth(billingMonth);
        dto.setTotalEmployeesProcessed(ledgers.size());
        dto.setTotalGrossPayout(grossPayout);
        dto.setTotalTaxDeducted(taxDeducted);
        dto.setTotalPfDeducted(pfDeducted);
        dto.setTotalLopDeductions(lopDeductions);
        dto.setTotalNetDisbursement(netDisbursement);
        dto.setDepartmentCostBreakdown(deptCost);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PayslipDto generateSalarySlip(Long userId, String billingMonth) {
        return payrollService.getPayslip(userId, billingMonth);
    }
}
