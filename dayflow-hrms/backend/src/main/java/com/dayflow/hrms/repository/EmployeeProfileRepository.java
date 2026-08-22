package com.dayflow.hrms.repository;

import com.dayflow.hrms.entity.EmployeeProfile;
import com.dayflow.hrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {
    Optional<EmployeeProfile> findByUser(User user);
    Optional<EmployeeProfile> findByUserId(Long userId);
    Optional<EmployeeProfile> findByEmail(String email);

    @Query("SELECT p FROM EmployeeProfile p WHERE (:department IS NULL OR p.department = :department)")
    List<EmployeeProfile> findByDepartmentFilter(@Param("department") String department);
}
