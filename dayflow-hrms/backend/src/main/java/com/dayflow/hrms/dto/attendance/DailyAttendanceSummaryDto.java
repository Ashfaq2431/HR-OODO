package com.dayflow.hrms.dto.attendance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class DailyAttendanceSummaryDto {

    private LocalDate todayDate;
    private String status;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private BigDecimal workedHours;
    private boolean checkedIn;
    private boolean checkedOut;
    private boolean onApprovedLeave;
    private Long activeLeaveRequestId;

    public DailyAttendanceSummaryDto() {
    }

    public LocalDate getTodayDate() {
        return todayDate;
    }

    public void setTodayDate(LocalDate todayDate) {
        this.todayDate = todayDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public BigDecimal getWorkedHours() {
        return workedHours;
    }

    public void setWorkedHours(BigDecimal workedHours) {
        this.workedHours = workedHours;
    }

    public boolean isCheckedIn() {
        return checkedIn;
    }

    public void setCheckedIn(boolean checkedIn) {
        this.checkedIn = checkedIn;
    }

    public boolean isCheckedOut() {
        return checkedOut;
    }

    public void setCheckedOut(boolean checkedOut) {
        this.checkedOut = checkedOut;
    }

    public boolean isOnApprovedLeave() {
        return onApprovedLeave;
    }

    public void setOnApprovedLeave(boolean onApprovedLeave) {
        this.onApprovedLeave = onApprovedLeave;
    }

    public Long getActiveLeaveRequestId() {
        return activeLeaveRequestId;
    }

    public void setActiveLeaveRequestId(Long activeLeaveRequestId) {
        this.activeLeaveRequestId = activeLeaveRequestId;
    }
}
