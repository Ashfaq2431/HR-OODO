package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.payroll.PayslipDto;

public interface EmailNotificationService {
    void sendEmail(String to, String subject, String body);
    void sendVerificationEmail(String to, String employeeName, String token);
    void sendLeaveSubmittedEmail(String to, String employeeName, String leaveType, String startDate, String endDate);
    void sendLeaveApprovalEmail(String to, String employeeName, String leaveType, String startDate, String endDate, String comments);
    void sendLeaveRejectionEmail(String to, String employeeName, String leaveType, String startDate, String endDate, String comments);
    void sendEarlyReturnRequestEmail(String to, String employeeName, String requestDate, String reason);
    void sendEarlyReturnApprovalEmail(String to, String employeeName, String requestDate, String comments);
    void sendEarlyReturnRejectionEmail(String to, String employeeName, String requestDate, String comments);
    void sendPayrollEmail(String to, String employeeName, String billingMonth, String finalSalary);
    void sendSalarySlipEmail(String to, String employeeName, String billingMonth, PayslipDto payslip);
}
