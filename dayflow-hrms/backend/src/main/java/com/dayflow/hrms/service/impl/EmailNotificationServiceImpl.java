package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.payroll.PayslipDto;
import com.dayflow.hrms.service.EmailNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.client.url:http://localhost:5173}")
    private String clientUrl;

    @Value("${spring.mail.username:no-reply@dayflow.com}")
    private String fromEmail;

    @Override
    public void sendEmail(String to, String subject, String body) {
        log.info("================ EMAIL DISPATCH ================");
        log.info("TO: {}", to);
        log.info("SUBJECT: {}", subject);
        log.info("CONTENT:\n{}", body);
        log.info("================================================");

        if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                log.info("SMTP email delivered successfully to {}", to);
            } catch (Exception ex) {
                log.warn("SMTP delivery skipped or failed (dev fallback active): {}", ex.getMessage());
            }
        }
    }

    @Override
    public void sendVerificationEmail(String to, String employeeName, String token) {
        String verifyUrl = clientUrl + "/verify-email?token=" + token;
        String subject = "Verify Your Dayflow HRMS Account";
        String body = "Hello " + employeeName + ",\n\n"
                + "Welcome to Dayflow HRMS!\n"
                + "Please verify your email address by clicking the link below:\n\n"
                + verifyUrl + "\n\n"
                + "If you did not create this account, please ignore this email.\n\n"
                + "Regards,\nDayflow HR Team";
        sendEmail(to, subject, body);
    }

    @Override
    public void sendLeaveSubmittedEmail(String to, String employeeName, String leaveType, String startDate, String endDate) {
        String subject = "Leave Application Received - Dayflow HRMS";
        String body = "Hello " + employeeName + ",\n\n"
                + "Your request for " + leaveType + " leave from " + startDate + " to " + endDate + " has been submitted.\n"
                + "Your HR manager will review it shortly.\n\n"
                + "Regards,\nDayflow HR Team";
        sendEmail(to, subject, body);
    }

    @Override
    public void sendLeaveApprovalEmail(String to, String employeeName, String leaveType, String startDate, String endDate, String comments) {
        String subject = "Leave Application Approved - Dayflow HRMS";
        String body = "Hello " + employeeName + ",\n\n"
                + "Great news! Your request for " + leaveType + " leave from " + startDate + " to " + endDate + " has been APPROVED.\n"
                + (comments != null && !comments.isBlank() ? ("HR Comments: " + comments + "\n") : "")
                + "\nRegards,\nDayflow HR Team";
        sendEmail(to, subject, body);
    }

    @Override
    public void sendLeaveRejectionEmail(String to, String employeeName, String leaveType, String startDate, String endDate, String comments) {
        String subject = "Leave Application Update - Dayflow HRMS";
        String body = "Hello " + employeeName + ",\n\n"
                + "Your request for " + leaveType + " leave from " + startDate + " to " + endDate + " has been REJECTED.\n"
                + (comments != null && !comments.isBlank() ? ("HR Comments: " + comments + "\n") : "")
                + "\nPlease contact your reporting manager for further details.\n\n"
                + "Regards,\nDayflow HR Team";
        sendEmail(to, subject, body);
    }

    @Override
    public void sendEarlyReturnRequestEmail(String to, String employeeName, String requestDate, String reason) {
        String subject = "Early Return & Check-In Request - Dayflow HRMS";
        String body = "Hello,\n\n"
                + "Employee " + employeeName + " has requested an Early Return from approved leave on " + requestDate + ".\n"
                + "Reason: " + reason + "\n\n"
                + "Please log in to the HR Admin Console to review and approve/reject this request.\n\n"
                + "Regards,\nDayflow HRMS Notification System";
        sendEmail(to, subject, body);
    }

    @Override
    public void sendEarlyReturnApprovalEmail(String to, String employeeName, String requestDate, String comments) {
        String subject = "Early Return Request Approved - Dayflow HRMS";
        String body = "Hello " + employeeName + ",\n\n"
                + "Your Early Return request for " + requestDate + " has been APPROVED by HR.\n"
                + "Your leave record has been updated and you are now authorized to check in.\n"
                + (comments != null && !comments.isBlank() ? ("HR Comments: " + comments + "\n") : "")
                + "\nRegards,\nDayflow HR Team";
        sendEmail(to, subject, body);
    }

    @Override
    public void sendEarlyReturnRejectionEmail(String to, String employeeName, String requestDate, String comments) {
        String subject = "Early Return Request Update - Dayflow HRMS";
        String body = "Hello " + employeeName + ",\n\n"
                + "Your Early Return request for " + requestDate + " has been REJECTED by HR.\n"
                + "Your existing approved leave remains in effect.\n"
                + (comments != null && !comments.isBlank() ? ("HR Comments: " + comments + "\n") : "")
                + "\nRegards,\nDayflow HR Team";
        sendEmail(to, subject, body);
    }

    @Override
    public void sendPayrollEmail(String to, String employeeName, String billingMonth, String finalSalary) {
        String subject = "Payroll Processed for " + billingMonth + " - Dayflow HRMS";
        String body = "Hello " + employeeName + ",\n\n"
                + "Your salary for the month of " + billingMonth + " has been processed.\n"
                + "Net Disbursed Salary: $" + finalSalary + "\n"
                + "You can view and download your full salary slip from your Dayflow employee dashboard.\n\n"
                + "Regards,\nDayflow Finance & HR Team";
        sendEmail(to, subject, body);
    }

    @Override
    public void sendSalarySlipEmail(String to, String employeeName, String billingMonth, PayslipDto payslip) {
        String subject = "Salary Slip for " + billingMonth + " - Dayflow HRMS";
        String body = "Hello " + employeeName + ",\n\n"
                + "Please find your salary breakdown for " + billingMonth + ":\n\n"
                + "Employee ID: " + payslip.getEmployeeId() + "\n"
                + "Designation: " + payslip.getDesignation() + "\n"
                + "Basic Pay: $" + payslip.getBasicPay() + "\n"
                + "Allowances: $" + payslip.getAllowances() + "\n"
                + "Gross Earnings: $" + payslip.getGrossEarnings() + "\n"
                + "Tax Deductions: -$" + payslip.getTaxDeductions() + "\n"
                + "PF Deductions: -$" + payslip.getProvidentFund() + "\n"
                + "Loss of Pay (LOP) Deductions (" + payslip.getUnpaidLeaveDays() + " days): -$" + payslip.getLopDeduction() + "\n"
                + "----------------------------------------\n"
                + "NET SALARY: $" + payslip.getNetSalary() + "\n\n"
                + "Regards,\nDayflow Payroll Team";
        sendEmail(to, subject, body);
    }
}
