package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.payroll.*;

import java.util.List;

public interface PayrollService {
    List<PayrollDto> runMonthlyPayroll(RunPayrollRequest request, Long adminUserId, String ipAddress);
    PayrollDto recalculatePayroll(Long userId, String billingMonth, Long adminUserId, String ipAddress);
    SalaryStructureDto updateSalaryStructure(Long userId, SalaryStructureDto dto, Long adminUserId, String ipAddress);
    List<PayrollDto> getMyPayrollRecords(Long userId);
    PayslipDto getPayslip(Long userId, String billingMonth);
    List<PayrollDto> getGlobalPayroll(String billingMonth);
    SalaryStructureDto getSalaryStructure(Long userId);
}
