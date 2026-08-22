package com.dayflow.hrms.dto.leave;

public class LeaveReviewRequest {

    private String hrComments;

    public LeaveReviewRequest() {
    }

    public LeaveReviewRequest(String hrComments) {
        this.hrComments = hrComments;
    }

    public String getHrComments() {
        return hrComments;
    }

    public void setHrComments(String hrComments) {
        this.hrComments = hrComments;
    }
}
