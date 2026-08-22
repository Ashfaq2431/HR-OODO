package com.dayflow.hrms.dto.leave;

import jakarta.validation.constraints.NotBlank;

public class LeaveRecallRequest {

    @NotBlank(message = "Recall reason is required")
    private String reason;

    public LeaveRecallRequest() {
    }

    public LeaveRecallRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
