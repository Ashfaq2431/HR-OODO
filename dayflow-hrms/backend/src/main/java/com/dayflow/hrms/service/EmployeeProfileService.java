package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.profile.AdminOverrideProfileRequest;
import com.dayflow.hrms.dto.profile.EmployeeProfileDto;
import com.dayflow.hrms.dto.profile.UpdateProfileRequest;

import java.util.List;

public interface EmployeeProfileService {
    EmployeeProfileDto getProfileByUserId(Long userId);
    EmployeeProfileDto updateLimitedProfile(Long userId, UpdateProfileRequest request, String ipAddress);
    EmployeeProfileDto adminOverrideProfile(Long targetUserId, AdminOverrideProfileRequest request, Long adminUserId, String ipAddress);
    List<EmployeeProfileDto> getAllEmployees(String departmentFilter);
    EmployeeProfileDto getEmployeeById(Long targetUserId);
}
