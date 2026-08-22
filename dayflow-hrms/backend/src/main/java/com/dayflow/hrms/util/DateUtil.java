package com.dayflow.hrms.util;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DateUtil {

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private DateUtil() {
    }

    public static int calculateDaysInMonth(String billingMonth) {
        YearMonth ym = YearMonth.parse(billingMonth, MONTH_FORMATTER);
        return ym.lengthOfMonth();
    }

    public static LocalDate getMonthStartDate(String billingMonth) {
        YearMonth ym = YearMonth.parse(billingMonth, MONTH_FORMATTER);
        return ym.atDay(1);
    }

    public static LocalDate getMonthEndDate(String billingMonth) {
        YearMonth ym = YearMonth.parse(billingMonth, MONTH_FORMATTER);
        return ym.atEndOfMonth();
    }

    public static int countOverlappingDays(LocalDate reqStart, LocalDate reqEnd, LocalDate monthStart, LocalDate monthEnd) {
        LocalDate overlapStart = reqStart.isAfter(monthStart) ? reqStart : monthStart;
        LocalDate overlapEnd = reqEnd.isBefore(monthEnd) ? reqEnd : monthEnd;

        if (!overlapStart.isAfter(overlapEnd)) {
            return (int) (ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1);
        }
        return 0;
    }
}
