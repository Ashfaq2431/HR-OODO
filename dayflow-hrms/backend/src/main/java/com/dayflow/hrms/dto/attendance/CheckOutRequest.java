package com.dayflow.hrms.dto.attendance;

public class CheckOutRequest {

    private String remarks;

    public CheckOutRequest() {
    }

    public CheckOutRequest(String remarks) {
        this.remarks = remarks;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
