package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.payroll.*;
import com.dayflow.hrms.entity.EmployeeProfile;
import com.dayflow.hrms.entity.LeaveRequest;
import com.dayflow.hrms.entity.PayrollLedger;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.LeaveType;
import com.dayflow.hrms.enums.NotificationType;
import com.dayflow.hrms.enums.RoleType;
import com.dayflow.hrms.exception.BadRequestException;
import com.dayflow.hrms.exception.ResourceNotFoundException;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.LeaveRequestRepository;
import com.dayflow.hrms.repository.PayrollLedgerRepository;
import com.dayflow.hrms.repository.UserRepository;
import com.dayflow.hrms.service.AuditLogService;
import com.dayflow.hrms.service.EmailNotificationService;
import com.dayflow.hrms.service.NotificationService;
import com.dayflow.hrms.service.PayrollService;
import com.dayflow.hrms.util.DateUtil;
import com.dayflow.hrms.util.PayrollCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PayrollServiceImpl implements PayrollService {

    private final PayrollLedgerRepository payrollLedgerRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final EmailNotificationService emailService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public PayrollServiceImpl(PayrollLedgerRepository payrollLedgerRepository,
                              UserRepository userRepository,
                              EmployeeProfileRepository employeeProfileRepository,
                              LeaveRequestRepository leaveRequestRepository,
                              EmailNotificationService emailService,
                              NotificationService notificationService,
                              AuditLogService auditLogService) {
        this.payrollLedgerRepository = payrollLedgerRepository;
        this.userRepository = userRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public List<PayrollDto> runMonthlyPayroll(RunPayrollRequest request, Long adminUserId, String ipAddress) {
        String billingMonth = request.getBillingMonth();
        int daysInMonth = DateUtil.calculateDaysInMonth(billingMonth);
        LocalDate monthStart = DateUtil.getMonthStartDate(billingMonth);
        LocalDate monthEnd = DateUtil.getMonthEndDate(billingMonth);

        List<User> employees = userRepository.findAll().stream()
                .filter(u -> u.getRole() == RoleType.ROLE_EMPLOYEE)
                .collect(Collectors.toList());

        List<PayrollDto> results = new ArrayList<>();

        for (User emp : employees) {
            Optional<PayrollLedger> existingOpt = payrollLedgerRepository.findByUserIdAndBillingMonth(emp.getId(), billingMonth);

            if (existingOpt.isPresent() && !request.isForceRecalculate()) {
                results.add(toDto(existingOpt.get()));
                continue;
            }

            EmployeeProfile profile = employeeProfileRepository.findByUser(emp)
                    .orElseGet(() -> {
                        EmployeeProfile p = new EmployeeProfile();
                        p.setUser(emp);
                        p.setBasicPay(BigDecimal.valueOf(50000));
                        p.setAllowances(BigDecimal.valueOf(5000));
                        p.calculateGrossPay();
                        return employeeProfileRepository.save(p);
                    });

            // Count approved UNPAID leaves within this month
            int unpaidLeaveDays = countUnpaidLeaveDaysInMonth(emp.getId(), monthStart, monthEnd);

            BigDecimal grossPay = PayrollCalculator.calculateGrossPay(profile.getBasicPay(), profile.getAllowances());
            BigDecimal lopDeductions = PayrollCalculator.calculateLopDeduction(grossPay, daysInMonth, unpaidLeaveDays);
            BigDecimal taxDeduction = profile.getTaxDeduction() != null ? profile.getTaxDeduction() : BigDecimal.ZERO;
            BigDecimal pfDeduction = profile.getPfDeduction() != null ? profile.getPfDeduction() : BigDecimal.ZERO;
            BigDecimal finalSalary = PayrollCalculator.calculateFinalSalary(grossPay, taxDeduction, pfDeduction, lopDeductions);

            PayrollLedger ledger = existingOpt.orElseGet(() -> {
                PayrollLedger l = new PayrollLedger();
                l.setUser(emp);
                l.setBillingMonth(billingMonth);
                return l;
            });

            ledger.setBasicPay(profile.getBasicPay());
            ledger.setAllowances(profile.getAllowances());
            ledger.setGrossPay(grossPay);
            ledger.setTaxDeductions(taxDeduction);
            ledger.setProvidentFund(pfDeduction);
            ledger.setUnpaidLeaveCount(unpaidLeaveDays);
            ledger.setUnpaidLeaveDeductions(lopDeductions);
            ledger.setTotalFinalSalary(finalSalary);
            ledger.setPaymentStatus("PROCESSED");
            ledger.setProcessedAt(LocalDateTime.now());

            PayrollLedger saved = payrollLedgerRepository.save(ledger);
            results.add(toDto(saved));

            // Notify employee
            emailService.sendPayrollEmail(
                    emp.getEmail(),
                    profile.getFirstName() + " " + profile.getLastName(),
                    billingMonth,
                    finalSalary.toString()
            );

            notificationService.createNotification(
                    emp.getId(),
                    "Payroll Processed: " + billingMonth,
                    "Your salary for " + billingMonth + " has been processed. Final Net: $" + finalSalary,
                    NotificationType.PAYROLL
            );
        }

        auditLogService.logAction(
                adminUserId,
                "MONTHLY_PAYROLL_RUN",
                "PayrollLedger",
                billingMonth,
                null,
                "Processed " + results.size() + " payroll records for " + billingMonth,
                ipAddress
        );

        return results;
    }

    @Override
    @Transactional
    public PayrollDto recalculatePayroll(Long userId, String billingMonth, Long adminUserId, String ipAddress) {
        User emp = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + userId));

        int daysInMonth = DateUtil.calculateDaysInMonth(billingMonth);
        LocalDate monthStart = DateUtil.getMonthStartDate(billingMonth);
        LocalDate monthEnd = DateUtil.getMonthEndDate(billingMonth);

        EmployeeProfile profile = employeeProfileRepository.findByUser(emp)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        int unpaidLeaveDays = countUnpaidLeaveDaysInMonth(emp.getId(), monthStart, monthEnd);

        BigDecimal grossPay = PayrollCalculator.calculateGrossPay(profile.getBasicPay(), profile.getAllowances());
        BigDecimal lopDeductions = PayrollCalculator.calculateLopDeduction(grossPay, daysInMonth, unpaidLeaveDays);
        BigDecimal taxDeduction = profile.getTaxDeduction() != null ? profile.getTaxDeduction() : BigDecimal.ZERO;
        BigDecimal pfDeduction = profile.getPfDeduction() != null ? profile.getPfDeduction() : BigDecimal.ZERO;
        BigDecimal finalSalary = PayrollCalculator.calculateFinalSalary(grossPay, taxDeduction, pfDeduction, lopDeductions);

        PayrollLedger ledger = payrollLedgerRepository.findByUserIdAndBillingMonth(userId, billingMonth)
                .orElseGet(() -> {
                    PayrollLedger l = new PayrollLedger();
                    l.setUser(emp);
                    l.setBillingMonth(billingMonth);
                    return l;
                });

        ledger.setBasicPay(profile.getBasicPay());
        ledger.setAllowances(profile.getAllowances());
        ledger.setGrossPay(grossPay);
        ledger.setTaxDeductions(taxDeduction);
        ledger.setProvidentFund(pfDeduction);
        ledger.setUnpaidLeaveCount(unpaidLeaveDays);
        ledger.setUnpaidLeaveDeductions(lopDeductions);
        ledger.setTotalFinalSalary(finalSalary);
        ledger.setPaymentStatus("PROCESSED");
        ledger.setProcessedAt(LocalDateTime.now());

        PayrollLedger saved = payrollLedgerRepository.save(ledger);

        auditLogService.logAction(
                adminUserId,
                "PAYROLL_RECALCULATED",
                "PayrollLedger",
                saved.getId().toString(),
                "User: " + userId + ", Month: " + billingMonth,
                "Final Salary: $" + finalSalary,
                ipAddress
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public SalaryStructureDto updateSalaryStructure(Long userId, SalaryStructureDto dto, Long adminUserId, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        EmployeeProfile profile = employeeProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        if (dto.getBasicPay() != null) profile.setBasicPay(dto.getBasicPay());
        if (dto.getAllowances() != null) profile.setAllowances(dto.getAllowances());
        if (dto.getTaxDeduction() != null) profile.setTaxDeduction(dto.getTaxDeduction());
        if (dto.getPfDeduction() != null) profile.setPfDeduction(dto.getPfDeduction());
        profile.calculateGrossPay();

        EmployeeProfile saved = employeeProfileRepository.save(profile);

        auditLogService.logAction(
                adminUserId,
                "SALARY_STRUCTURE_MODIFIED",
                "EmployeeProfile",
                saved.getId().toString(),
                "User: " + userId,
                "Basic: $" + saved.getBasicPay() + ", Allowances: $" + saved.getAllowances(),
                ipAddress
        );

        notificationService.createNotification(
                userId,
                "Salary Structure Updated",
                "HR has updated your compensation structure. New Gross: $" + saved.getGrossPay(),
                NotificationType.PAYROLL
        );

        return toSalaryStructureDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollDto> getMyPayrollRecords(Long userId) {
        return payrollLedgerRepository.findByUserIdOrderByBillingMonthDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PayslipDto getPayslip(Long userId, String billingMonth) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        EmployeeProfile profile = employeeProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        PayrollLedger ledger = payrollLedgerRepository.findByUserIdAndBillingMonth(userId, billingMonth)
                .orElseThrow(() -> new ResourceNotFoundException("No payroll record found for " + billingMonth));

        int daysInMonth = DateUtil.calculateDaysInMonth(billingMonth);
        BigDecimal dailyRate = PayrollCalculator.calculateDailySalary(ledger.getGrossPay(), daysInMonth);
        BigDecimal totalDeductions = ledger.getTaxDeductions()
                .add(ledger.getProvidentFund())
                .add(ledger.getUnpaidLeaveDeductions());

        PayslipDto payslip = new PayslipDto();
        payslip.setPayslipId(ledger.getId());
        payslip.setUserId(user.getId());
        payslip.setEmployeeId(user.getEmployeeId());
        payslip.setEmployeeName(profile.getFirstName() + " " + profile.getLastName());
        payslip.setEmail(user.getEmail());
        payslip.setDepartment(profile.getDepartment());
        payslip.setDesignation(profile.getDesignation());
        payslip.setJoiningDate(profile.getJoiningDate());
        payslip.setBillingMonth(billingMonth);
        payslip.setDaysInMonth(daysInMonth);
        payslip.setDailyRate(dailyRate);

        payslip.setBasicPay(ledger.getBasicPay());
        payslip.setAllowances(ledger.getAllowances());
        payslip.setGrossEarnings(ledger.getGrossPay());

        payslip.setTaxDeductions(ledger.getTaxDeductions());
        payslip.setProvidentFund(ledger.getProvidentFund());
        payslip.setUnpaidLeaveDays(ledger.getUnpaidLeaveCount());
        payslip.setLopDeduction(ledger.getUnpaidLeaveDeductions());
        payslip.setTotalDeductions(totalDeductions);

        payslip.setNetSalary(ledger.getTotalFinalSalary());
        payslip.setPaymentStatus(ledger.getPaymentStatus());
        payslip.setGeneratedAt(ledger.getProcessedAt());

        return payslip;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollDto> getGlobalPayroll(String billingMonth) {
        List<PayrollLedger> ledgers;
        if (billingMonth != null && !billingMonth.isBlank()) {
            ledgers = payrollLedgerRepository.findByBillingMonth(billingMonth);
        } else {
            ledgers = payrollLedgerRepository.findAll();
        }

        return ledgers.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SalaryStructureDto getSalaryStructure(Long userId) {
        EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
        return toSalaryStructureDto(profile);
    }

    private int countUnpaidLeaveDaysInMonth(Long userId, LocalDate monthStart, LocalDate monthEnd) {
        List<LeaveRequest> unpaidLeaves = leaveRequestRepository.findApprovedLeavesInMonth(
                userId, LeaveType.UNPAID, monthStart, monthEnd
        );

        int totalDays = 0;
        for (LeaveRequest leave : unpaidLeaves) {
            totalDays += DateUtil.countOverlappingDays(leave.getStartDate(), leave.getEndDate(), monthStart, monthEnd);
        }
        return totalDays;
    }

    private PayrollDto toDto(PayrollLedger ledger) {
        PayrollDto dto = new PayrollDto();
        dto.setId(ledger.getId());
        dto.setUserId(ledger.getUser().getId());
        dto.setEmployeeId(ledger.getUser().getEmployeeId());
        dto.setBillingMonth(ledger.getBillingMonth());
        dto.setBasicPay(ledger.getBasicPay());
        dto.setAllowances(ledger.getAllowances());
        dto.setGrossPay(ledger.getGrossPay());
        dto.setTaxDeductions(ledger.getTaxDeductions());
        dto.setProvidentFund(ledger.getProvidentFund());
        dto.setUnpaidLeaveCount(ledger.getUnpaidLeaveCount());
        dto.setUnpaidLeaveDeductions(ledger.getUnpaidLeaveDeductions());
        dto.setTotalFinalSalary(ledger.getTotalFinalSalary());
        dto.setPaymentStatus(ledger.getPaymentStatus());
        dto.setProcessedAt(ledger.getProcessedAt());

        EmployeeProfile profile = employeeProfileRepository.findByUser(ledger.getUser()).orElse(null);
        if (profile != null) {
            dto.setEmployeeName(profile.getFirstName() + " " + profile.getLastName());
            dto.setDepartment(profile.getDepartment());
            dto.setDesignation(profile.getDesignation());
        }

        return dto;
    }

    private SalaryStructureDto toSalaryStructureDto(EmployeeProfile profile) {
        SalaryStructureDto dto = new SalaryStructureDto();
        dto.setUserId(profile.getUser().getId());
        dto.setEmployeeId(profile.getUser().getEmployeeId());
        dto.setEmployeeName(profile.getFirstName() + " " + profile.getLastName());
        dto.setBasicPay(profile.getBasicPay());
        dto.setAllowances(profile.getAllowances());
        dto.setGrossPay(profile.getGrossPay());
        dto.setTaxDeduction(profile.getTaxDeduction());
        dto.setPfDeduction(profile.getPfDeduction());
        return dto;
    }
}
