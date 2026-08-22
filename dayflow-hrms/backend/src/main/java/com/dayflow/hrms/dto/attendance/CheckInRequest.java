package com.dayflow.hrms.dto.attendance;

public class CheckInRequest {

    private String remarks;

    public CheckInRequest() {
    }

    public CheckInRequest(String remarks) {
        this.remarks = remarks;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
