package com.dayflow.hrms.repository;

import com.dayflow.hrms.entity.EarlyReturnRequest;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.EarlyReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EarlyReturnRequestRepository extends JpaRepository<EarlyReturnRequest, Long> {

    List<EarlyReturnRequest> findByUserOrderByCreatedAtDesc(User user);

    List<EarlyReturnRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<EarlyReturnRequest> findByStatusOrderByCreatedAtAsc(EarlyReturnStatus status);

    List<EarlyReturnRequest> findAllByOrderByCreatedAtDesc();

    @Query("SELECT e FROM EarlyReturnRequest e WHERE e.user.id = :userId " +
           "AND e.requestDate = :date " +
           "AND e.status = :status")
    Optional<EarlyReturnRequest> findByUserIdAndRequestDateAndStatus(
            @Param("userId") Long userId,
            @Param("date") LocalDate date,
            @Param("status") EarlyReturnStatus status);
}
