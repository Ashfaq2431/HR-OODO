package com.dayflow.hrms.dto.report;

import java.util.Map;

public class LeaveSummaryReportDto {

    private long totalRequests;
    private long pendingRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private long withdrawnRequests;
    private long paidLeavesTaken;
    private long sickLeavesTaken;
    private long unpaidLeavesTaken;
    private Map<String, Long> leavesByDepartment;

    public LeaveSummaryReportDto() {
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getApprovedRequests() {
        return approvedRequests;
    }

    public void setApprovedRequests(long approvedRequests) {
        this.approvedRequests = approvedRequests;
    }

    public long getRejectedRequests() {
        return rejectedRequests;
    }

    public void setRejectedRequests(long rejectedRequests) {
        this.rejectedRequests = rejectedRequests;
    }

    public long getWithdrawnRequests() {
        return withdrawnRequests;
    }

    public void setWithdrawnRequests(long withdrawnRequests) {
        this.withdrawnRequests = withdrawnRequests;
    }

    public long getPaidLeavesTaken() {
        return paidLeavesTaken;
    }

    public void setPaidLeavesTaken(long paidLeavesTaken) {
        this.paidLeavesTaken = paidLeavesTaken;
    }

    public long getSickLeavesTaken() {
        return sickLeavesTaken;
    }

    public void setSickLeavesTaken(long sickLeavesTaken) {
        this.sickLeavesTaken = sickLeavesTaken;
    }

    public long getUnpaidLeavesTaken() {
        return unpaidLeavesTaken;
    }

    public void setUnpaidLeavesTaken(long unpaidLeavesTaken) {
        this.unpaidLeavesTaken = unpaidLeavesTaken;
    }

    public Map<String, Long> getLeavesByDepartment() {
        return leavesByDepartment;
    }

    public void setLeavesByDepartment(Map<String, Long> leavesByDepartment) {
        this.leavesByDepartment = leavesByDepartment;
    }
}
