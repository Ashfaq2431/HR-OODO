package com.dayflow.hrms.dto.report;

import java.math.BigDecimal;
import java.util.Map;

public class PayrollReportDto {

    private String billingMonth;
    private long totalEmployeesProcessed;
    private BigDecimal totalGrossPayout;
    private BigDecimal totalTaxDeducted;
    private BigDecimal totalPfDeducted;
    private BigDecimal totalLopDeductions;
    private BigDecimal totalNetDisbursement;
    private Map<String, BigDecimal> departmentCostBreakdown;

    public PayrollReportDto() {
    }

    public String getBillingMonth() {
        return billingMonth;
    }

    public void setBillingMonth(String billingMonth) {
        this.billingMonth = billingMonth;
    }

    public long getTotalEmployeesProcessed() {
        return totalEmployeesProcessed;
    }

    public void setTotalEmployeesProcessed(long totalEmployeesProcessed) {
        this.totalEmployeesProcessed = totalEmployeesProcessed;
    }

    public BigDecimal getTotalGrossPayout() {
        return totalGrossPayout;
    }

    public void setTotalGrossPayout(BigDecimal totalGrossPayout) {
        this.totalGrossPayout = totalGrossPayout;
    }

    public BigDecimal getTotalTaxDeducted() {
        return totalTaxDeducted;
    }

    public void setTotalTaxDeducted(BigDecimal totalTaxDeducted) {
        this.totalTaxDeducted = totalTaxDeducted;
    }

    public BigDecimal getTotalPfDeducted() {
        return totalPfDeducted;
    }

    public void setTotalPfDeducted(BigDecimal totalPfDeducted) {
        this.totalPfDeducted = totalPfDeducted;
    }

    public BigDecimal getTotalLopDeductions() {
        return totalLopDeductions;
    }

    public void setTotalLopDeductions(BigDecimal totalLopDeductions) {
        this.totalLopDeductions = totalLopDeductions;
    }

    public BigDecimal getTotalNetDisbursement() {
        return totalNetDisbursement;
    }

    public void setTotalNetDisbursement(BigDecimal totalNetDisbursement) {
        this.totalNetDisbursement = totalNetDisbursement;
    }

    public Map<String, BigDecimal> getDepartmentCostBreakdown() {
        return departmentCostBreakdown;
    }

    public void setDepartmentCostBreakdown(Map<String, BigDecimal> departmentCostBreakdown) {
        this.departmentCostBreakdown = departmentCostBreakdown;
    }
}
