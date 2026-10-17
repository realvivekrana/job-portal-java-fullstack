package com.jobportal.controller;

import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.dto.response.UserResponse;
import com.jobportal.entity.Role;
import com.jobportal.security.CustomUserDetails;
import com.jobportal.service.AdminService;
import com.jobportal.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    public AdminController(AdminService adminService, UserService userService) {
        this.adminService = adminService;
        this.userService = userService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> stats() {
        return ResponseEntity.ok(ApiResponse.ok("Platform stats", adminService.stats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> users(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Users", userService.search(role, keyword, page, size)));
    }

    /** Enable or disable an account: PATCH /api/admin/users/5/status?active=false */
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> setUserStatus(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @RequestParam boolean active) {
        String msg = active ? "User enabled" : "User disabled";
        return ResponseEntity.ok(ApiResponse.ok(msg, userService.setActive(principal.getId(), id, active)));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobResponse>>> jobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Jobs", adminService.jobs(keyword, active, page, size)));
    }

    @PatchMapping("/jobs/{id}/status")
    public ResponseEntity<ApiResponse<JobResponse>> setJobStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        String msg = active ? "Job reopened" : "Job closed";
        return ResponseEntity.ok(ApiResponse.ok(msg, adminService.setJobActive(id, active)));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        adminService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.ok("Job deleted", null));
    }
}