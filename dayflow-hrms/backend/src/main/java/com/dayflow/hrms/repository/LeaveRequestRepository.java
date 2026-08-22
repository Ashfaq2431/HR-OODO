package com.dayflow.hrms.repository;

import com.dayflow.hrms.entity.LeaveRequest;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.LeaveStatus;
import com.dayflow.hrms.enums.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByUserOrderByCreatedAtDesc(User user);

    List<LeaveRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<LeaveRequest> findByStatusOrderByCreatedAtAsc(LeaveStatus status);

    List<LeaveRequest> findAllByOrderByCreatedAtDesc();

    @Query("SELECT l FROM LeaveRequest l WHERE l.user.id = :userId " +
           "AND l.status = 'APPROVED' " +
           "AND :date BETWEEN l.startDate AND l.endDate")
    Optional<LeaveRequest> findApprovedLeaveForDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT l FROM LeaveRequest l WHERE l.user.id = :userId " +
           "AND l.status IN ('PENDING', 'APPROVED') " +
           "AND (:excludeId IS NULL OR l.id <> :excludeId) " +
           "AND ((l.startDate BETWEEN :startDate AND :endDate) OR (l.endDate BETWEEN :startDate AND :endDate) OR (:startDate BETWEEN l.startDate AND l.endDate))")
    List<LeaveRequest> findOverlappingRequests(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeId") Long excludeId);

    @Query("SELECT l FROM LeaveRequest l WHERE l.user.id = :userId " +
           "AND l.leaveType = :leaveType " +
           "AND l.status = 'APPROVED' " +
           "AND ((l.startDate BETWEEN :startDate AND :endDate) OR (l.endDate BETWEEN :startDate AND :endDate) OR (:startDate BETWEEN l.startDate AND l.endDate))")
    List<LeaveRequest> findApprovedLeavesInMonth(
            @Param("userId") Long userId,
            @Param("leaveType") LeaveType leaveType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
