package com.dayflow.hrms.dto.payroll;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class RunPayrollRequest {

    @NotBlank(message = "Billing month is required")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Billing month must be in format YYYY-MM")
    private String billingMonth;

    private boolean forceRecalculate = false;

    public RunPayrollRequest() {
    }

    public RunPayrollRequest(String billingMonth, boolean forceRecalculate) {
        this.billingMonth = billingMonth;
        this.forceRecalculate = forceRecalculate;
    }

    public String getBillingMonth() {
        return billingMonth;
    }

    public void setBillingMonth(String billingMonth) {
        this.billingMonth = billingMonth;
    }

    public boolean isForceRecalculate() {
        return forceRecalculate;
    }

    public void setForceRecalculate(boolean forceRecalculate) {
        this.forceRecalculate = forceRecalculate;
    }
}
