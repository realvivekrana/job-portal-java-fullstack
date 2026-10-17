package com.jobportal.controller;

import com.jobportal.dto.request.ApplicationRequest;
import com.jobportal.dto.request.StatusUpdateRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.entity.ApplicationStatus;
import com.jobportal.security.CustomUserDetails;
import com.jobportal.service.ApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * Apply to a job. Send multipart/form-data with optional "coverLetter" (text) and
     * optional "resume" (file). Without a file, the resume saved in the profile is used.
     */
    @PostMapping(value = "/job/{jobId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long jobId,
            @Valid @ModelAttribute ApplicationRequest request,
            @RequestPart(value = "resume", required = false) MultipartFile resume) {
        ApplicationResponse data = applicationService.apply(principal.getId(), jobId, request, resume);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Application submitted", data));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> myApplications(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Your applications",
                applicationService.myApplications(principal.getId(), page, size)));
    }

    @GetMapping("/my/stats")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> myStats(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Application stats",
                applicationService.candidateStats(principal.getId())));
    }

    /** Applicants of a job (recruiter who posted it). Optional ?status=SHORTLISTED filter. */
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> forJob(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Applicants",
                applicationService.forJob(principal.getId(), jobId, status, page, size)));
    }

    @GetMapping("/recruiter/stats")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> recruiterStats(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Recruiter stats",
                applicationService.recruiterStats(principal.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getById(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Application",
                applicationService.getById(principal.getId(), principal.getUser().getRole(), id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated",
                applicationService.updateStatus(principal.getId(), id, request)));
    }

    /** Withdraw an application that is still in APPLIED status. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {
        applicationService.withdraw(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Application withdrawn", null));
    }
}