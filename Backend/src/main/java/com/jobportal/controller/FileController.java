package com.jobportal.controller;

import com.jobportal.security.CustomUserDetails;
import com.jobportal.service.ApplicationService;
import com.jobportal.service.FileStorageService;
import com.jobportal.service.FileStorageService.Category;
import com.jobportal.util.FileUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Files")
public class FileController {

    private final FileStorageService fileStorageService;
    private final ApplicationService applicationService;

    public FileController(FileStorageService fileStorageService, ApplicationService applicationService) {
        this.fileStorageService = fileStorageService;
        this.applicationService = applicationService;
    }

    /** Company logos are public. */
    @GetMapping("/logos/{filename:.+}")
    public ResponseEntity<Resource> logo(@PathVariable String filename) {
        return serve(Category.LOGO, filename, CacheControl.maxAge(Duration.ofDays(1)).cachePublic());
    }

    /** Resumes are private: the candidate, the recruiter of the job applied to, or an admin. */
    @GetMapping("/resumes/{filename:.+}")
    public ResponseEntity<Resource> resume(@AuthenticationPrincipal CustomUserDetails principal,
                                           @PathVariable String filename) {
        if (!applicationService.canViewResume(principal.getId(), principal.getUser().getRole(), filename)) {
            throw new AccessDeniedException("You do not have access to this file");
        }
        return serve(Category.RESUME, filename, CacheControl.noStore());
    }

    private ResponseEntity<Resource> serve(Category category, String filename, CacheControl cacheControl) {
        Resource resource = fileStorageService.load(category, filename);
        String contentType = FileUtil.contentType(filename);
        boolean inline = contentType.equals("application/pdf") || contentType.startsWith("image/");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .cacheControl(cacheControl)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        (inline ? "inline" : "attachment") + "; filename=\"" + filename + "\"")
                .body(resource);
    }
}