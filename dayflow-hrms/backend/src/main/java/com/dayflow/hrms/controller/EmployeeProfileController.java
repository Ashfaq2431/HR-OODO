package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.profile.EmployeeProfileDto;
import com.dayflow.hrms.dto.profile.UpdateProfileRequest;
import com.dayflow.hrms.entity.Document;
import com.dayflow.hrms.repository.DocumentRepository;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.EmployeeProfileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeProfileController {

    private final EmployeeProfileService profileService;
    private final DocumentRepository documentRepository;

    public EmployeeProfileController(EmployeeProfileService profileService, DocumentRepository documentRepository) {
        this.profileService = profileService;
        this.documentRepository = documentRepository;
    }

    @GetMapping("/me/profile")
    public ResponseEntity<ApiResponse<EmployeeProfileDto>> getMyProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        EmployeeProfileDto profile = profileService.getProfileByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", profile));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<ApiResponse<EmployeeProfileDto>> updateMyProfile(@RequestBody UpdateProfileRequest request,
                                                                           @AuthenticationPrincipal UserPrincipal currentUser,
                                                                           HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        EmployeeProfileDto updated = profileService.updateLimitedProfile(currentUser.getId(), request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @GetMapping("/me/documents")
    public ResponseEntity<ApiResponse<List<Document>>> getMyDocuments(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Document> docs = documentRepository.findByUserIdOrderByUploadedAtDesc(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Documents retrieved", docs));
    }
}
