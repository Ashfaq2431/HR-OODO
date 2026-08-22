package com.dayflow.hrms.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PayrollCalculatorTest {

    @Test
    @DisplayName("Calculate Gross Pay: Basic + Allowances")
    void testCalculateGrossPay() {
        BigDecimal basic = BigDecimal.valueOf(75000);
        BigDecimal allowances = BigDecimal.valueOf(10000);

        BigDecimal gross = PayrollCalculator.calculateGrossPay(basic, allowances);
        assertEquals(new BigDecimal("85000.00"), gross);
    }

    @Test
    @DisplayName("Calculate Daily Salary")
    void testCalculateDailySalary() {
        BigDecimal gross = BigDecimal.valueOf(85000);
        int daysInMonth = 31; // July/August

        BigDecimal daily = PayrollCalculator.calculateDailySalary(gross, daysInMonth);
        assertEquals(new BigDecimal("2741.9355"), daily);
    }

    @Test
    @DisplayName("Calculate Loss of Pay (LOP) for 2 unpaid days in 31-day month")
    void testCalculateLopDeduction() {
        BigDecimal gross = BigDecimal.valueOf(85000);
        int daysInMonth = 31;
        int unpaidDays = 2;

        BigDecimal lop = PayrollCalculator.calculateLopDeduction(gross, daysInMonth, unpaidDays);
        assertEquals(new BigDecimal("5483.87"), lop);
    }

    @Test
    @DisplayName("Calculate Final Salary with LOP, Tax, and PF Deductions")
    void testCalculateFinalSalary() {
        BigDecimal gross = BigDecimal.valueOf(85000);
        BigDecimal tax = BigDecimal.valueOf(10200);
        BigDecimal pf = BigDecimal.valueOf(4250);
        BigDecimal lop = BigDecimal.valueOf(5483.87);

        BigDecimal net = PayrollCalculator.calculateFinalSalary(gross, tax, pf, lop);
        assertEquals(new BigDecimal("65066.13"), net);
    }
}
