package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.dto.profile.AdminOverrideProfileRequest;
import com.dayflow.hrms.dto.profile.EmployeeProfileDto;
import com.dayflow.hrms.dto.profile.UpdateProfileRequest;
import com.dayflow.hrms.entity.EmployeeProfile;
import com.dayflow.hrms.entity.User;
import com.dayflow.hrms.enums.NotificationType;
import com.dayflow.hrms.exception.ResourceNotFoundException;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.UserRepository;
import com.dayflow.hrms.service.AuditLogService;
import com.dayflow.hrms.service.EmployeeProfileService;
import com.dayflow.hrms.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeProfileServiceImpl implements EmployeeProfileService {

    private final EmployeeProfileRepository employeeProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public EmployeeProfileServiceImpl(EmployeeProfileRepository employeeProfileRepository,
                                     UserRepository userRepository,
                                     NotificationService notificationService,
                                     AuditLogService auditLogService) {
        this.employeeProfileRepository = employeeProfileRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeProfileDto getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        EmployeeProfile profile = employeeProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        return toDto(profile, user);
    }

    @Override
    @Transactional
    public EmployeeProfileDto updateLimitedProfile(Long userId, UpdateProfileRequest request, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        EmployeeProfile profile = employeeProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        String oldDetails = "phone=" + profile.getPhoneNumber() + ", address=" + profile.getHomeAddress();

        if (request.getPhoneNumber() != null) {
            profile.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getHomeAddress() != null) {
            profile.setHomeAddress(request.getHomeAddress().trim());
        }
        if (request.getProfilePictureUrl() != null) {
            profile.setProfilePictureUrl(request.getProfilePictureUrl().trim());
        }

        EmployeeProfile saved = employeeProfileRepository.save(profile);

        String newDetails = "phone=" + saved.getPhoneNumber() + ", address=" + saved.getHomeAddress();

        auditLogService.logAction(
                userId,
                "EMPLOYEE_PROFILE_UPDATE",
                "EmployeeProfile",
                saved.getId().toString(),
                oldDetails,
                newDetails,
                ipAddress
        );

        notificationService.createNotification(
                userId,
                "Profile Updated",
                "Your contact details have been updated successfully.",
                NotificationType.PROFILE
        );

        return toDto(saved, user);
    }

    @Override
    @Transactional
    public EmployeeProfileDto adminOverrideProfile(Long targetUserId, AdminOverrideProfileRequest request, Long adminUserId, String ipAddress) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found with id: " + targetUserId));

        EmployeeProfile profile = employeeProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    EmployeeProfile newProfile = new EmployeeProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) profile.setLastName(request.getLastName().trim());
        if (request.getEmail() != null) {
            profile.setEmail(request.getEmail().trim().toLowerCase());
            user.setEmail(request.getEmail().trim().toLowerCase());
        }
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber().trim());
        if (request.getHomeAddress() != null) profile.setHomeAddress(request.getHomeAddress().trim());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getProfilePictureUrl() != null) profile.setProfilePictureUrl(request.getProfilePictureUrl().trim());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment().trim());
        if (request.getDesignation() != null) profile.setDesignation(request.getDesignation().trim());
        if (request.getJoiningDate() != null) profile.setJoiningDate(request.getJoiningDate());
        if (request.getEmploymentType() != null) profile.setEmploymentType(request.getEmploymentType());
        if (request.getReportingManager() != null) profile.setReportingManager(request.getReportingManager().trim());
        if (request.getBasicPay() != null) profile.setBasicPay(request.getBasicPay());
        if (request.getAllowances() != null) profile.setAllowances(request.getAllowances());
        if (request.getTaxDeduction() != null) profile.setTaxDeduction(request.getTaxDeduction());
        if (request.getPfDeduction() != null) profile.setPfDeduction(request.getPfDeduction());

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
        }

        userRepository.save(user);
        EmployeeProfile saved = employeeProfileRepository.save(profile);

        auditLogService.logAction(
                adminUserId,
                "ADMIN_OVERRIDE_PROFILE",
                "EmployeeProfile",
                saved.getId().toString(),
                "Target User: " + targetUserId,
                "Admin override performed",
                ipAddress
        );

        notificationService.createNotification(
                targetUserId,
                "Profile Updated by HR",
                "Your HR administrator has updated your profile and employment details.",
                NotificationType.PROFILE
        );

        return toDto(saved, user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeProfileDto> getAllEmployees(String departmentFilter) {
        List<EmployeeProfile> profiles;
        if (departmentFilter != null && !departmentFilter.isBlank() && !departmentFilter.equalsIgnoreCase("ALL")) {
            profiles = employeeProfileRepository.findByDepartmentFilter(departmentFilter);
        } else {
            profiles = employeeProfileRepository.findAll();
        }

        return profiles.stream()
                .map(p -> toDto(p, p.getUser()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeProfileDto getEmployeeById(Long targetUserId) {
        return getProfileByUserId(targetUserId);
    }

    private EmployeeProfileDto toDto(EmployeeProfile profile, User user) {
        EmployeeProfileDto dto = new EmployeeProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(user.getId());
        dto.setEmployeeId(user.getEmployeeId());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setHomeAddress(profile.getHomeAddress());
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setProfilePictureUrl(profile.getProfilePictureUrl());
        dto.setDepartment(profile.getDepartment());
        dto.setDesignation(profile.getDesignation());
        dto.setJoiningDate(profile.getJoiningDate());
        dto.setEmploymentType(profile.getEmploymentType());
        dto.setReportingManager(profile.getReportingManager());
        dto.setBasicPay(profile.getBasicPay());
        dto.setAllowances(profile.getAllowances());
        dto.setGrossPay(profile.getGrossPay());
        dto.setTaxDeduction(profile.getTaxDeduction());
        dto.setPfDeduction(profile.getPfDeduction());
        dto.setRole(user.getRole());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }
}
