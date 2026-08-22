package com.dayflow.hrms.exception;

public class AttendanceException extends RuntimeException {

    private final String errorCode;
    private Long leaveRequestId;

    public AttendanceException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public AttendanceException(String message, String errorCode, Long leaveRequestId) {
        super(message);
        this.errorCode = errorCode;
        this.leaveRequestId = leaveRequestId;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Long getLeaveRequestId() {
        return leaveRequestId;
    }
}
