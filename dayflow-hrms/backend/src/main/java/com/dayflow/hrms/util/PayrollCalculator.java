package com.dayflow.hrms.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class PayrollCalculator {

    private PayrollCalculator() {
    }

    public static BigDecimal calculateGrossPay(BigDecimal basicPay, BigDecimal allowances) {
        BigDecimal basic = (basicPay != null) ? basicPay : BigDecimal.ZERO;
        BigDecimal allow = (allowances != null) ? allowances : BigDecimal.ZERO;
        return basic.add(allow).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateDailySalary(BigDecimal grossPay, int daysInMonth) {
        if (daysInMonth <= 0 || grossPay == null || grossPay.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return grossPay.divide(BigDecimal.valueOf(daysInMonth), 4, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateLopDeduction(BigDecimal grossPay, int daysInMonth, int unpaidLeaveDays) {
        if (unpaidLeaveDays <= 0 || daysInMonth <= 0 || grossPay == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal dailySalary = calculateDailySalary(grossPay, daysInMonth);
        BigDecimal deduction = dailySalary.multiply(BigDecimal.valueOf(unpaidLeaveDays));
        return deduction.setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateFinalSalary(BigDecimal grossPay,
                                                 BigDecimal taxDeduction,
                                                 BigDecimal pfDeduction,
                                                 BigDecimal lopDeduction) {
        BigDecimal gross = (grossPay != null) ? grossPay : BigDecimal.ZERO;
        BigDecimal tax = (taxDeduction != null) ? taxDeduction : BigDecimal.ZERO;
        BigDecimal pf = (pfDeduction != null) ? pfDeduction : BigDecimal.ZERO;
        BigDecimal lop = (lopDeduction != null) ? lopDeduction : BigDecimal.ZERO;

        BigDecimal totalDeductions = tax.add(pf).add(lop);
        BigDecimal finalSalary = gross.subtract(totalDeductions);

        // Salary cannot be negative
        if (finalSalary.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return finalSalary.setScale(2, RoundingMode.HALF_UP);
    }
}
