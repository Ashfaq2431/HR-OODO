package com.dayflow.hrms.repository;

import com.dayflow.hrms.entity.PayrollLedger;
import com.dayflow.hrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollLedgerRepository extends JpaRepository<PayrollLedger, Long> {

    List<PayrollLedger> findByUserOrderByBillingMonthDesc(User user);

    List<PayrollLedger> findByUserIdOrderByBillingMonthDesc(Long userId);

    Optional<PayrollLedger> findByUserIdAndBillingMonth(Long userId, String billingMonth);

    List<PayrollLedger> findByBillingMonth(String billingMonth);

    boolean existsByUserIdAndBillingMonth(Long userId, String billingMonth);
}
