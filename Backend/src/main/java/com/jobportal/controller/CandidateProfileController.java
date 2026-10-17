package com.jobportal.controller;

import com.jobportal.dto.request.ProfileRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.security.CustomUserDetails;
import com.jobportal.service.CandidateProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("hasRole('CANDIDATE')")
@Tag(name = "Candidate Profile")
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    public CandidateProfileController(CandidateProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> mine(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Your profile", profileService.getMine(principal.getId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> update(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", profileService.update(principal.getId(), request)));
    }

    /** multipart/form-data with a "file" part (pdf, doc or docx, max 5 MB). */
    @PostMapping(value = "/me/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfileResponse>> uploadResume(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok("Resume uploaded", profileService.uploadResume(principal.getId(), file)));
    }

    @DeleteMapping("/me/resume")
    public ResponseEntity<ApiResponse<ProfileResponse>> removeResume(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Resume removed", profileService.removeResume(principal.getId())));
    }
}