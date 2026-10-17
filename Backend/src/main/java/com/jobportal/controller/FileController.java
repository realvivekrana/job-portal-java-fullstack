package com.jobportal.controller;

import com.jobportal.security.CustomUserDetails;
import com.jobportal.service.CandidateProfileService;
import com.jobportal.util.FileUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Files")
public class FileController {

    private final CandidateProfileService profileService;

    public FileController(CandidateProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * Needs the Authorization header, so the frontend must fetch this with axios
     * (responseType: 'blob') and not with a plain link.
     */
    @GetMapping("/resumes/{filename}")
    public ResponseEntity<Resource> resume(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String filename) {
        Resource resource = profileService.loadResume(principal.getId(), principal.getUser().getRole(), filename);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(FileUtil.contentTypeFor(FileUtil.extension(filename))))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .body(resource);
    }
}