package com.jobportal.controller;

import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.security.CustomUserDetails;
import com.jobportal.service.SavedJobService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Saved jobs ("Save" / "Saved" on Indeed). Candidates only. */
@RestController
@RequestMapping("/api/saved-jobs")
@PreAuthorize("hasRole('CANDIDATE')")
@Tag(name = "Saved jobs")
public class SavedJobController {

    private final SavedJobService savedJobService;

    public SavedJobController(SavedJobService savedJobService) {
        this.savedJobService = savedJobService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<JobResponse>>> list(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Saved jobs", savedJobService.list(principal.getId(), page, size)));
    }

    /** Only the ids, so search pages can paint the bookmark icons with one request. */
    @GetMapping("/ids")
    public ResponseEntity<ApiResponse<List<Long>>> ids(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Saved job ids", savedJobService.savedIds(principal.getId())));
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Void>> save(@AuthenticationPrincipal CustomUserDetails principal,
                                                  @PathVariable Long jobId) {
        savedJobService.save(principal.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.ok("Job saved", null));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Void>> remove(@AuthenticationPrincipal CustomUserDetails principal,
                                                    @PathVariable Long jobId) {
        savedJobService.remove(principal.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.ok("Job removed from saved", null));
    }
}