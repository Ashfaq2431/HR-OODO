package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.auth.AuthResponse;
import com.dayflow.hrms.dto.auth.LoginRequest;
import com.dayflow.hrms.dto.auth.SignUpRequest;
import com.dayflow.hrms.entity.EmployeeProfile;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.EmploymentType;
import com.dayflow.hrms.enums.NotificationType;
import com.dayflow.hrms.enums.RoleType;
import com.dayflow.hrms.exception.BadRequestException;
import com.dayflow.hrms.exception.ConflictException;
import com.dayflow.hrms.exception.ResourceNotFoundException;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.UserRepository;
import com.dayflow.hrms.security.JwtTokenProvider;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.AuditLogService;
import com.dayflow.hrms.service.AuthService;
import com.dayflow.hrms.service.EmailNotificationService;
import com.dayflow.hrms.service.NotificationService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailNotificationService emailService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public AuthServiceImpl(UserRepository userRepository,
                           EmployeeProfileRepository employeeProfileRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           EmailNotificationService emailService,
                           NotificationService notificationService,
                           AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public AuthResponse signUp(SignUpRequest request, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with email " + request.getEmail() + " already exists.");
        }

        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new ConflictException("Employee ID " + request.getEmployeeId() + " is already registered.");
        }

        RoleType assignedRole = request.getRole() != null ? request.getRole() : RoleType.ROLE_EMPLOYEE;
        String verificationToken = UUID.randomUUID().toString();

        User user = new User(
                request.getEmployeeId().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                assignedRole
        );
        user.setVerificationToken(verificationToken);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        // Initialize default employee profile
        EmployeeProfile profile = new EmployeeProfile();
        profile.setUser(savedUser);
        profile.setFirstName(request.getFirstName().trim());
        profile.setLastName(request.getLastName().trim());
        profile.setEmail(savedUser.getEmail());
        profile.setJoiningDate(LocalDate.now());
        profile.setEmploymentType(EmploymentType.FULL_TIME);
        profile.setDepartment("General");
        profile.setDesignation("Employee");
        profile.setBasicPay(BigDecimal.valueOf(50000));
        profile.setAllowances(BigDecimal.valueOf(5000));
        profile.setGrossPay(BigDecimal.valueOf(55000));
        profile.setTaxDeduction(BigDecimal.valueOf(5500));
        profile.setPfDeduction(BigDecimal.valueOf(2750));

        employeeProfileRepository.save(profile);

        // Trigger email verification
        emailService.sendVerificationEmail(savedUser.getEmail(), profile.getFirstName(), verificationToken);

        // System notification
        notificationService.createNotification(
                savedUser.getId(),
                "Welcome to Dayflow HRMS",
                "Your account has been created. Please check your email to verify your address.",
                NotificationType.SYSTEM
        );

        auditLogService.logAction(
                savedUser.getId(),
                "USER_SIGNUP",
                "User",
                savedUser.getId().toString(),
                null,
                "Registered with role " + assignedRole,
                ipAddress
        );

        String token = tokenProvider.generateTokenFromUserId(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmployeeId(),
                savedUser.getEmail(),
                profile.getFirstName(),
                profile.getLastName(),
                savedUser.getRole(),
                savedUser.isEmailVerified()
        );
    }

    @Override
    @Transactional
    public AuthResponse signIn(LoginRequest request, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EmployeeProfile profile = employeeProfileRepository.findByUser(user).orElse(null);
        String firstName = profile != null ? profile.getFirstName() : "Admin";
        String lastName = profile != null ? profile.getLastName() : "User";

        auditLogService.logAction(
                user.getId(),
                "USER_LOGIN",
                "User",
                user.getId().toString(),
                null,
                "Successful login",
                ipAddress
        );

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmployeeId(),
                user.getEmail(),
                firstName,
                lastName,
                user.getRole(),
                user.isEmailVerified()
        );
    }

    @Override
    @Transactional
    public boolean verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Verification token is missing");
        }

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification token"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        notificationService.createNotification(
                user.getId(),
                "Email Verified",
                "Your email has been verified successfully.",
                NotificationType.SYSTEM
        );

        auditLogService.logAction(
                user.getId(),
                "EMAIL_VERIFIED",
                "User",
                user.getId().toString(),
                "emailVerified=false",
                "emailVerified=true",
                "system"
        );

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EmployeeProfile profile = employeeProfileRepository.findByUser(user).orElse(null);
        String firstName = profile != null ? profile.getFirstName() : "";
        String lastName = profile != null ? profile.getLastName() : "";

        String token = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmployeeId(),
                user.getEmail(),
                firstName,
                lastName,
                user.getRole(),
                user.isEmailVerified()
        );
    }
}
