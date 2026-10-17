package com.jobportal.service.impl;

import com.jobportal.dto.request.ProfileRequest;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.mapper.ProfileMapper;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.CandidateProfileRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.CandidateProfileService;
import com.jobportal.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class CandidateProfileServiceImpl implements CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final FileStorageService fileStorageService;

    public CandidateProfileServiceImpl(CandidateProfileRepository profileRepository,
                                       UserRepository userRepository,
                                       ApplicationRepository applicationRepository,
                                       FileStorageService fileStorageService) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMine(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(ProfileMapper::toResponse)
                .orElseGet(() -> ProfileMapper.empty(findUser(userId)));
    }

    @Override
    @Transactional
    public ProfileResponse saveMine(Long userId, ProfileRequest request) {
        CandidateProfile profile = findOrNew(userId);
        profile.setPhone(clean(request.phone()));
        profile.setLocation(clean(request.location()));
        profile.setSkills(normalizeSkills(request.skills()));
        profile.setExperience(clean(request.experience()));
        profile.setEducation(clean(request.education()));
        return ProfileMapper.toResponse(profileRepository.save(profile));
    }

    @Override
    @Transactional
    public ProfileResponse uploadResume(Long userId, MultipartFile file) {
        String newName = fileStorageService.storeResume(file);
        try {
            CandidateProfile profile = findOrNew(userId);
            String oldName = profile.getResumePath();
            profile.setResumePath(newName);
            CandidateProfile saved = profileRepository.save(profile);

            // Past applications keep the resume they were sent with, so only delete an unused old file.
            String deleteAfterCommit = (oldName != null && !applicationRepository.existsByResumePath(oldName))
                    ? oldName : null;
            registerFileCleanup(newName, deleteAfterCommit);

            return ProfileMapper.toResponse(saved);
        } catch (RuntimeException e) {
            fileStorageService.deleteResume(newName);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadResume(Long requesterId, Role requesterRole, String filename) {
        if (!canViewResume(requesterId, requesterRole, filename)) {
            throw new AccessDeniedException("You are not allowed to view this resume");
        }
        return fileStorageService.loadResume(filename);
    }

    // ---------------- helpers ----------------

    private boolean canViewResume(Long requesterId, Role role, String filename) {
        return switch (role) {
            case ADMIN -> true;
            case CANDIDATE -> profileRepository.findByUserId(requesterId)
                    .map(CandidateProfile::getResumePath)
                    .filter(filename::equals)
                    .isPresent()
                    || applicationRepository.existsByResumePathAndCandidateId(filename, requesterId);
            case RECRUITER -> applicationRepository.existsByResumePathAndJobPostedById(filename, requesterId);
        };
    }

    /** Touch the disk only after we know how the transaction ended. */
    private void registerFileCleanup(String newName, String oldNameToDelete) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED) {
                    if (oldNameToDelete != null) {
                        fileStorageService.deleteResume(oldNameToDelete);
                    }
                } else {
                    fileStorageService.deleteResume(newName);
                }
            }
        });
    }

    private CandidateProfile findOrNew(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.builder().user(findUser(userId)).build());
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return null;
        }
        String joined = Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(","));
        return joined.isEmpty() ? null : joined;
    }
}