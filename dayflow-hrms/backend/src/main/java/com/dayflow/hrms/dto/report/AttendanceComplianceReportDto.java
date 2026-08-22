package com.dayflow.hrms.dto.report;

import java.math.BigDecimal;
import java.util.Map;

public class AttendanceComplianceReportDto {

    private long totalEmployees;
    private long totalPresentToday;
    private long totalAbsentToday;
    private long totalOnLeaveToday;
    private long totalHalfDayToday;
    private double averageWorkingHours;
    private double overallComplianceRate;
    private Map<String, Long> departmentAttendanceBreakdown;

    public AttendanceComplianceReportDto() {
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getTotalPresentToday() {
        return totalPresentToday;
    }

    public void setTotalPresentToday(long totalPresentToday) {
        this.totalPresentToday = totalPresentToday;
    }

    public long getTotalAbsentToday() {
        return totalAbsentToday;
    }

    public void setTotalAbsentToday(long totalAbsentToday) {
        this.totalAbsentToday = totalAbsentToday;
    }

    public long getTotalOnLeaveToday() {
        return totalOnLeaveToday;
    }

    public void setTotalOnLeaveToday(long totalOnLeaveToday) {
        this.totalOnLeaveToday = totalOnLeaveToday;
    }

    public long getTotalHalfDayToday() {
        return totalHalfDayToday;
    }

    public void setTotalHalfDayToday(long totalHalfDayToday) {
        this.totalHalfDayToday = totalHalfDayToday;
    }

    public double getAverageWorkingHours() {
        return averageWorkingHours;
    }

    public void setAverageWorkingHours(double averageWorkingHours) {
        this.averageWorkingHours = averageWorkingHours;
    }

    public double getOverallComplianceRate() {
        return overallComplianceRate;
    }

    public void setOverallComplianceRate(double overallComplianceRate) {
        this.overallComplianceRate = overallComplianceRate;
    }

    public Map<String, Long> getDepartmentAttendanceBreakdown() {
        return departmentAttendanceBreakdown;
    }

    public void setDepartmentAttendanceBreakdown(Map<String, Long> departmentAttendanceBreakdown) {
        this.departmentAttendanceBreakdown = departmentAttendanceBreakdown;
    }
}
