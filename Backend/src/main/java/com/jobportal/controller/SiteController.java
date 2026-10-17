package com.jobportal.controller;

import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.PublicOverview;
import com.jobportal.service.SiteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Site")
public class SiteController {

    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    /** Public: website texts (name, hero, footer, ...). */
    @GetMapping("/public/site")
    public ResponseEntity<ApiResponse<Map<String, String>>> site() {
        return ResponseEntity.ok(ApiResponse.ok("Site", siteService.getSettings()));
    }

    /** Public: live stats, job type counts, popular searches, top hiring companies. */
    @GetMapping("/public/overview")
    public ResponseEntity<ApiResponse<PublicOverview>> overview() {
        return ResponseEntity.ok(ApiResponse.ok("Overview", siteService.overview()));
    }

    /** Admin: change website texts. A blank value restores the default. */
    @PutMapping("/admin/site")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> update(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Site updated", siteService.updateSettings(body)));
    }
}