package com.dayflow.hrms.dto.earlyreturn;

public class EarlyReturnReviewDto {

    private String hrComments;

    public EarlyReturnReviewDto() {
    }

    public EarlyReturnReviewDto(String hrComments) {
        this.hrComments = hrComments;
    }

    public String getHrComments() {
        return hrComments;
    }

    public void setHrComments(String hrComments) {
        this.hrComments = hrComments;
    }
}
