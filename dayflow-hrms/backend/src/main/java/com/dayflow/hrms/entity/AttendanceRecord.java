package com.dayflow.hrms.entity;

import com.dayflow.hrms.enums.AttendanceStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_records", uniqueConstraints = {
    @UniqueConstraint(name = "uq_user_attendance_date", columnNames = {"user_id", "date"})
})
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Column(name = "total_worked_hours", precision = 5, scale = 2)
    private BigDecimal totalWorkedHours = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AttendanceStatus status = AttendanceStatus.ABSENT;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "manually_overridden", nullable = false)
    private boolean manuallyOverridden = false;

    @Column(name = "override_reason", columnDefinition = "TEXT")
    private String overrideReason;

    @Column(name = "overridden_by", length = 100)
    private String overriddenBy;

    @Column(name = "overridden_at")
    private LocalDateTime overriddenAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AttendanceRecord() {
    }

    public AttendanceRecord(User user, LocalDate date, LocalTime checkInTime, AttendanceStatus status) {
        this.user = user;
        this.date = date;
        this.checkInTime = checkInTime;
        this.status = status != null ? status : AttendanceStatus.PRESENT;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        calculateWorkedHours();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculateWorkedHours();
    }

    public void calculateWorkedHours() {
        if (checkInTime != null && checkOutTime != null) {
            Duration duration = Duration.between(checkInTime, checkOutTime);
            if (!duration.isNegative()) {
                double hours = duration.toMinutes() / 60.0;
                this.totalWorkedHours = BigDecimal.valueOf(Math.round(hours * 100.0) / 100.0);
            }
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
        calculateWorkedHours();
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
        calculateWorkedHours();
    }

    public BigDecimal getTotalWorkedHours() {
        return totalWorkedHours;
    }

    public void setTotalWorkedHours(BigDecimal totalWorkedHours) {
        this.totalWorkedHours = totalWorkedHours;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public boolean isManuallyOverridden() {
        return manuallyOverridden;
    }

    public void setManuallyOverridden(boolean manuallyOverridden) {
        this.manuallyOverridden = manuallyOverridden;
    }

    public String getOverrideReason() {
        return overrideReason;
    }

    public void setOverrideReason(String overrideReason) {
        this.overrideReason = overrideReason;
    }

    public String getOverriddenBy() {
        return overriddenBy;
    }

    public void setOverriddenBy(String overriddenBy) {
        this.overriddenBy = overriddenBy;
    }

    public LocalDateTime getOverriddenAt() {
        return overriddenAt;
    }

    public void setOverriddenAt(LocalDateTime overriddenAt) {
        this.overriddenAt = overriddenAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
