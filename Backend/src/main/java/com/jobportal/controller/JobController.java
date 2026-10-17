package com.jobportal.controller;

import com.jobportal.dto.request.JobFilterRequest;
import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.entity.JobType;
import com.jobportal.security.CustomUserDetails;
import com.jobportal.service.JobService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody JobRequest request) {
        JobResponse data = jobService.create(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Job posted", data));
    }

    /** Public search. All filters are optional. */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<JobResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(required = false) Integer postedWithinDays,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        JobFilterRequest filter = new JobFilterRequest(keyword, location, jobType, minSalary, maxExperience, postedWithinDays);
        return ResponseEntity.ok(ApiResponse.ok("Jobs",
                jobService.search(filter, page, size, sortBy, sortDir)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<PageResponse<JobResponse>>> myJobs(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Your jobs", jobService.myJobs(principal.getId(), page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Job", jobService.getById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> update(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Job updated", jobService.update(principal.getId(), id, request)));
    }

    /** Close or reopen a job: PATCH /api/jobs/5/status?active=false */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> setStatus(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @RequestParam boolean active) {
        String msg = active ? "Job reopened" : "Job closed";
        return ResponseEntity.ok(ApiResponse.ok(msg, jobService.setActive(principal.getId(), id, active)));
    }
}