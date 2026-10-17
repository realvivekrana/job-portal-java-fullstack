package com.jobportal.service;

import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.CandidateProfileRepository;
import org.springframework.stereotype.Component;

/**
 * A resume file can be used by a candidate profile and by several applications at once.
 * It is deleted from disk only when nothing references it any more.
 */
@Component
public class ResumeFileCleaner {

    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository profileRepository;
    private final FileStorageService fileStorageService;

    public ResumeFileCleaner(ApplicationRepository applicationRepository,
                             CandidateProfileRepository profileRepository,
                             FileStorageService fileStorageService) {
        this.applicationRepository = applicationRepository;
        this.profileRepository = profileRepository;
        this.fileStorageService = fileStorageService;
    }

    public void deleteIfUnreferenced(String filename) {
        if (filename == null || filename.isBlank()) {
            return;
        }
        if (applicationRepository.existsByResumePath(filename) || profileRepository.existsByResumePath(filename)) {
            return;
        }
        fileStorageService.delete(FileStorageService.Category.RESUME, filename);
    }
}