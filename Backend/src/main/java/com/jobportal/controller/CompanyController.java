package com.jobportal.controller;

import com.jobportal.dto.request.CompanyRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.CompanyResponse;
import com.jobportal.security.CustomUserDetails;
import com.jobportal.service.CompanyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/companies")
@Tag(name = "Companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CompanyRequest request) {
        CompanyResponse data = companyService.create(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Company created", data));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> mine(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Your company", companyService.getMine(principal.getId())));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> update(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Company updated", companyService.update(principal.getId(), request)));
    }

    /** multipart/form-data with a "file" part (png, jpg or webp, max 5 MB). */
    @PostMapping(value = "/me/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> uploadLogo(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok("Logo uploaded", companyService.uploadLogo(principal.getId(), file)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Company", companyService.getById(id)));
    }
}