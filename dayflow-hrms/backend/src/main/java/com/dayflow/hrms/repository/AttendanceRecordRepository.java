package com.dayflow.hrms.repository;

import com.dayflow.hrms.entity.AttendanceRecord;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByUserAndDate(User user, LocalDate date);

    Optional<AttendanceRecord> findByUserIdAndDate(Long userId, LocalDate date);

    List<AttendanceRecord> findByUserOrderByDateDesc(User user);

    List<AttendanceRecord> findByUserIdOrderByDateDesc(Long userId);

    List<AttendanceRecord> findByUserIdAndDateBetweenOrderByDateAsc(Long userId, LocalDate startDate, LocalDate endDate);

    List<AttendanceRecord> findByDate(LocalDate date);

    List<AttendanceRecord> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT a FROM AttendanceRecord a WHERE " +
           "(:userId IS NULL OR a.user.id = :userId) AND " +
           "(:date IS NULL OR a.date = :date) AND " +
           "(:status IS NULL OR a.status = :status) " +
           "ORDER BY a.date DESC")
    List<AttendanceRecord> findWithFilters(
            @Param("userId") Long userId,
            @Param("date") LocalDate date,
            @Param("status") AttendanceStatus status);

    long countByUserIdAndStatusAndDateBetween(Long userId, AttendanceStatus status, LocalDate startDate, LocalDate endDate);
}
