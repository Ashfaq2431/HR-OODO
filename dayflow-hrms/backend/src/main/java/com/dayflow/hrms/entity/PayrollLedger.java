package com.dayflow.hrms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_ledgers", uniqueConstraints = {
    @UniqueConstraint(name = "uq_user_billing_month", columnNames = {"user_id", "billing_month"})
})
public class PayrollLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "billing_month", nullable = false, length = 7)
    private String billingMonth; // Format: YYYY-MM

    @Column(name = "basic_pay", precision = 12, scale = 2, nullable = false)
    private BigDecimal basicPay = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal allowances = BigDecimal.ZERO;

    @Column(name = "gross_pay", precision = 12, scale = 2, nullable = false)
    private BigDecimal grossPay = BigDecimal.ZERO;

    @Column(name = "tax_deductions", precision = 12, scale = 2, nullable = false)
    private BigDecimal taxDeductions = BigDecimal.ZERO;

    @Column(name = "provident_fund", precision = 12, scale = 2, nullable = false)
    private BigDecimal providentFund = BigDecimal.ZERO;

    @Column(name = "unpaid_leave_count", nullable = false)
    private int unpaidLeaveCount = 0;

    @Column(name = "unpaid_leave_deductions", precision = 12, scale = 2, nullable = false)
    private BigDecimal unpaidLeaveDeductions = BigDecimal.ZERO;

    @Column(name = "total_final_salary", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalFinalSalary = BigDecimal.ZERO;

    @Column(name = "payment_status", length = 30)
    private String paymentStatus = "PROCESSED";

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public PayrollLedger() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.processedAt == null) {
            this.processedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
