package com.dayflow.hrms.dto.payroll;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PayrollDto {

    private Long id;
    private Long userId;
    private String employeeId;
    private String employeeName;
    private String department;
    private String designation;
    private String billingMonth;
    private BigDecimal basicPay;
    private BigDecimal allowances;
    private BigDecimal grossPay;
    private BigDecimal taxDeductions;
    private BigDecimal providentFund;
    private int unpaidLeaveCount;
    private BigDecimal unpaidLeaveDeductions;
    private BigDecimal totalFinalSalary;
    private String paymentStatus;
    private LocalDateTime processedAt;

    public PayrollDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getBillingMonth() {
        return billingMonth;
    }

    public void setBillingMonth(String billingMonth) {
        this.billingMonth = billingMonth;
    }

    public BigDecimal getBasicPay() {
        return basicPay;
    }

    public void setBasicPay(BigDecimal basicPay) {
        this.basicPay = basicPay;
    }

    public BigDecimal getAllowances() {
        return allowances;
    }

    public void setAllowances(BigDecimal allowances) {
        this.allowances = allowances;
    }

    public BigDecimal getGrossPay() {
        return grossPay;
    }

    public void setGrossPay(BigDecimal grossPay) {
        this.grossPay = grossPay;
    }

    public BigDecimal getTaxDeductions() {
        return taxDeductions;
    }

    public void setTaxDeductions(BigDecimal taxDeductions) {
        this.taxDeductions = taxDeductions;
    }

    public BigDecimal getProvidentFund() {
        return providentFund;
    }

    public void setProvidentFund(BigDecimal providentFund) {
        this.providentFund = providentFund;
    }

    public int getUnpaidLeaveCount() {
        return unpaidLeaveCount;
    }

    public void setUnpaidLeaveCount(int unpaidLeaveCount) {
        this.unpaidLeaveCount = unpaidLeaveCount;
    }

    public BigDecimal getUnpaidLeaveDeductions() {
        return unpaidLeaveDeductions;
    }

    public void setUnpaidLeaveDeductions(BigDecimal unpaidLeaveDeductions) {
        this.unpaidLeaveDeductions = unpaidLeaveDeductions;
    }

    public BigDecimal getTotalFinalSalary() {
        return totalFinalSalary;
    }

    public void setTotalFinalSalary(BigDecimal totalFinalSalary) {
        this.totalFinalSalary = totalFinalSalary;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}
