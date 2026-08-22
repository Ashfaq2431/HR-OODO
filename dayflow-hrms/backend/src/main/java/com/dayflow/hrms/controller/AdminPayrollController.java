package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.payroll.*;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.PayrollService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payroll")
@PreAuthorize("hasAuthority('ROLE_HR_ADMIN')")
public class AdminPayrollController {

    private final PayrollService payrollService;

    public AdminPayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PayrollDto>>> getGlobalPayroll(
            @RequestParam(value = "month", required = false) String month) {

        List<PayrollDto> records = payrollService.getGlobalPayroll(month);
        return ResponseEntity.ok(ApiResponse.ok("Company payroll records retrieved", records));
    }

    @PostMapping("/run")
    public ResponseEntity<ApiResponse<List<PayrollDto>>> runMonthlyPayroll(
            @Valid @RequestBody RunPayrollRequest request,
            @AuthenticationPrincipal UserPrincipal adminUser,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        List<PayrollDto> processed = payrollService.runMonthlyPayroll(request, adminUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Monthly payroll processed successfully", processed));
    }

    @PostMapping("/recalculate/{userId}/{month}")
    public ResponseEntity<ApiResponse<PayrollDto>> recalculateEmployeePayroll(
            @PathVariable("userId") Long userId,
            @PathVariable("month") String month,
            @AuthenticationPrincipal UserPrincipal adminUser,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        PayrollDto dto = payrollService.recalculatePayroll(userId, month, adminUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Employee payroll recalculated successfully", dto));
    }

    @GetMapping("/salary/{userId}")
    public ResponseEntity<ApiResponse<SalaryStructureDto>> getSalaryStructure(@PathVariable("userId") Long userId) {
        SalaryStructureDto dto = payrollService.getSalaryStructure(userId);
        return ResponseEntity.ok(ApiResponse.ok("Salary structure retrieved", dto));
    }

    @PutMapping("/salary/{userId}")
    public ResponseEntity<ApiResponse<SalaryStructureDto>> updateSalaryStructure(
            @PathVariable("userId") Long userId,
            @RequestBody SalaryStructureDto dto,
            @AuthenticationPrincipal UserPrincipal adminUser,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        SalaryStructureDto updated = payrollService.updateSalaryStructure(userId, dto, adminUser.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok("Salary structure updated successfully", updated));
    }

    @GetMapping("/payslip/{userId}/{month}")
    public ResponseEntity<ApiResponse<PayslipDto>> getEmployeePayslip(
            @PathVariable("userId") Long userId,
            @PathVariable("month") String month) {

        PayslipDto payslip = payrollService.getPayslip(userId, month);
        return ResponseEntity.ok(ApiResponse.ok("Employee payslip retrieved", payslip));
    }
}
