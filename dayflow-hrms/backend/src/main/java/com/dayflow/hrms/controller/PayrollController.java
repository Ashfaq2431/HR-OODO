package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.payroll.PayrollDto;
import com.dayflow.hrms.dto.payroll.PayslipDto;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.PayrollService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<PayrollDto>>> getMyPayroll(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<PayrollDto> records = payrollService.getMyPayrollRecords(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Payroll history retrieved", records));
    }

    @GetMapping("/me/{month}/payslip")
    public ResponseEntity<ApiResponse<PayslipDto>> getMyPayslip(@PathVariable("month") String month,
                                                                @AuthenticationPrincipal UserPrincipal currentUser) {
        PayslipDto payslip = payrollService.getPayslip(currentUser.getId(), month);
        return ResponseEntity.ok(ApiResponse.ok("Payslip retrieved successfully", payslip));
    }
}
