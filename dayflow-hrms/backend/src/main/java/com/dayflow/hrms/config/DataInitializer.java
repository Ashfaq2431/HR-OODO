package com.dayflow.hrms.config;

import com.dayflow.hrms.entity.*;
import com.dayflow.hrms.enums.*;
import com.dayflow.hrms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollLedgerRepository payrollLedgerRepository;
    private final NotificationRepository notificationRepository;
    private final DocumentRepository documentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AdminUserRepository adminUserRepository,
                           EmployeeProfileRepository employeeProfileRepository,
                           AttendanceRecordRepository attendanceRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           PayrollLedgerRepository payrollLedgerRepository,
                           NotificationRepository notificationRepository,
                           DocumentRepository documentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adminUserRepository = adminUserRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollLedgerRepository = payrollLedgerRepository;
        this.notificationRepository = notificationRepository;
        this.documentRepository = documentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Checking and initializing DAYFLOW HRMS Default Accounts...");

        // 1. Ensure Default HR Admin
        Optional<User> adminOpt = userRepository.findByEmail("admin@dayflow.com");
        User savedAdmin;
        if (adminOpt.isEmpty()) {
            User admin = new User("EMP-ADMIN-001", "admin@dayflow.com", passwordEncoder.encode("Admin@123"), RoleType.ROLE_HR_ADMIN);
            admin.setEmailVerified(true);
            savedAdmin = userRepository.save(admin);

            AdminUser adminRegistry = new AdminUser("ADM-001", "admin@dayflow.com", passwordEncoder.encode("Admin@123"), RoleType.ROLE_HR_ADMIN);
            adminUserRepository.save(adminRegistry);

            EmployeeProfile adminProfile = new EmployeeProfile();
            adminProfile.setUser(savedAdmin);
            adminProfile.setFirstName("Eleanor");
            adminProfile.setLastName("Vance");
            adminProfile.setEmail(savedAdmin.getEmail());
            adminProfile.setPhoneNumber("+1 (555) 019-2834");
            adminProfile.setHomeAddress("100 Silicon Ave, Suite 500, San Francisco, CA");
            adminProfile.setDateOfBirth(LocalDate.of(1988, 4, 12));
            adminProfile.setProfilePictureUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150");
            adminProfile.setDepartment("Human Resources");
            adminProfile.setDesignation("HR Director");
            adminProfile.setJoiningDate(LocalDate.of(2021, 1, 15));
            adminProfile.setEmploymentType(EmploymentType.FULL_TIME);
            adminProfile.setReportingManager("Executive Board");
            adminProfile.setBasicPay(BigDecimal.valueOf(95000));
            adminProfile.setAllowances(BigDecimal.valueOf(15000));
            adminProfile.setTaxDeduction(BigDecimal.valueOf(16500));
            adminProfile.setPfDeduction(BigDecimal.valueOf(5500));
            employeeProfileRepository.save(adminProfile);
        } else {
            savedAdmin = adminOpt.get();
            savedAdmin.setPassword(passwordEncoder.encode("Admin@123"));
            savedAdmin.setEmailVerified(true);
            savedAdmin.setRole(RoleType.ROLE_HR_ADMIN);
            userRepository.save(savedAdmin);
        }

        // 2. Ensure Sample Employees
        ensureEmployee("EMP-2026-001", "alex.morgan@dayflow.com", "Alex", "Morgan", "Engineering", "Senior Backend Engineer",
                BigDecimal.valueOf(75000), BigDecimal.valueOf(10000), BigDecimal.valueOf(10200), BigDecimal.valueOf(4250),
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Eleanor Vance");

        ensureEmployee("EMP-2026-002", "sarah.connor@dayflow.com", "Sarah", "Connor", "Engineering", "Frontend Tech Lead",
                BigDecimal.valueOf(78000), BigDecimal.valueOf(11000), BigDecimal.valueOf(11125), BigDecimal.valueOf(4450),
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", "Eleanor Vance");

        ensureEmployee("EMP-2026-003", "david.miller@dayflow.com", "David", "Miller", "Product Design", "Lead UI/UX Designer",
                BigDecimal.valueOf(70000), BigDecimal.valueOf(8000), BigDecimal.valueOf(9360), BigDecimal.valueOf(3900),
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "Eleanor Vance");

        ensureEmployee("EMP-2026-004", "emily.watson@dayflow.com", "Emily", "Watson", "Quality Assurance", "QA Automation Engineer",
                BigDecimal.valueOf(62000), BigDecimal.valueOf(7000), BigDecimal.valueOf(8280), BigDecimal.valueOf(3450),
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "Alex Morgan");

        ensureEmployee("EMP-2026-005", "michael.chen@dayflow.com", "Michael", "Chen", "Engineering", "DevOps & Cloud Engineer",
                BigDecimal.valueOf(72000), BigDecimal.valueOf(9500), BigDecimal.valueOf(9780), BigDecimal.valueOf(4075),
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "Alex Morgan");

        log.info("DAYFLOW HRMS Verified: Admin (admin@dayflow.com / Admin@123) and Employees (Emp@123)");
    }

    private void ensureEmployee(String empId, String email, String first, String last, String dept, String desig,
                                BigDecimal basic, BigDecimal allow, BigDecimal tax, BigDecimal pf, String pic, String manager) {
        Optional<User> empOpt = userRepository.findByEmail(email);
        User saved;
        if (empOpt.isEmpty()) {
            User emp = new User(empId, email, passwordEncoder.encode("Emp@123"), RoleType.ROLE_EMPLOYEE);
            emp.setEmailVerified(true);
            saved = userRepository.save(emp);

            EmployeeProfile profile = new EmployeeProfile();
            profile.setUser(saved);
            profile.setFirstName(first);
            profile.setLastName(last);
            profile.setEmail(email);
            profile.setPhoneNumber("+1 (555) 012-3456");
            profile.setHomeAddress("123 Tech Way, Suite 100, City, State");
            profile.setDateOfBirth(LocalDate.of(1992, 6, 20));
            profile.setProfilePictureUrl(pic);
            profile.setDepartment(dept);
            profile.setDesignation(desig);
            profile.setJoiningDate(LocalDate.of(2023, 2, 1));
            profile.setEmploymentType(EmploymentType.FULL_TIME);
            profile.setReportingManager(manager);
            profile.setBasicPay(basic);
            profile.setAllowances(allow);
            profile.setTaxDeduction(tax);
            profile.setPfDeduction(pf);
            employeeProfileRepository.save(profile);

            // Seed attendance for yesterday
            AttendanceRecord att1 = new AttendanceRecord(saved, LocalDate.now().minusDays(1), LocalTime.of(9, 0), AttendanceStatus.PRESENT);
            att1.setCheckOutTime(LocalTime.of(17, 30));
            att1.calculateWorkedHours();
            attendanceRepository.save(att1);

            // Seed Notification
            Notification notif = new Notification(saved, "Welcome to Dayflow HRMS", "Your employee portal is ready. Explore features and configure your details.", NotificationType.SYSTEM);
            notificationRepository.save(notif);
        } else {
            saved = empOpt.get();
            saved.setPassword(passwordEncoder.encode("Emp@123"));
            saved.setEmailVerified(true);
            userRepository.save(saved);
        }
    }
}