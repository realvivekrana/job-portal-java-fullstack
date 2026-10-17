package com.jobportal.service.impl;

import com.jobportal.dto.request.ProfileRequest;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.mapper.ProfileMapper;
import com.jobportal.repository.CandidateProfileRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.CandidateProfileService;
import com.jobportal.service.FileStorageService;
import com.jobportal.service.ResumeFileCleaner;
import com.jobportal.util.TextUtil;
import com.jobportal.util.TransactionUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CandidateProfileServiceImpl implements CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ResumeFileCleaner resumeFileCleaner;

    public CandidateProfileServiceImpl(CandidateProfileRepository profileRepository,
                                       UserRepository userRepository,
                                       FileStorageService fileStorageService,
                                       ResumeFileCleaner resumeFileCleaner) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.resumeFileCleaner = resumeFileCleaner;
    }

    @Override
    @Transactional
    public ProfileResponse getMine(Long userId) {
        return ProfileMapper.toResponse(getOrCreate(userId));
    }

    @Override
    @Transactional
    public ProfileResponse update(Long userId, ProfileRequest request) {
        CandidateProfile profile = getOrCreate(userId);
        profile.setPhone(TextUtil.clean(request.phone()));
        profile.setLocation(TextUtil.clean(request.location()));
        profile.setSkills(TextUtil.normalizeCsv(request.skills()));
        profile.setExperience(TextUtil.clean(request.experience()));
        profile.setEducation(TextUtil.clean(request.education()));
        return ProfileMapper.toResponse(profileRepository.save(profile));
    }

    @Override
    @Transactional
    public ProfileResponse uploadResume(Long userId, MultipartFile file) {
        CandidateProfile profile = getOrCreate(userId);
        String oldResume = profile.getResumePath();

        String stored = fileStorageService.store(file, FileStorageService.Category.RESUME);
        profile.setResumePath(stored);
        CandidateProfile saved = profileRepository.saveAndFlush(profile);

        // old file may still belong to earlier applications: the cleaner checks that
        TransactionUtil.afterCommit(() -> resumeFileCleaner.deleteIfUnreferenced(oldResume));
        return ProfileMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProfileResponse removeResume(Long userId) {
        CandidateProfile profile = getOrCreate(userId);
        String oldResume = profile.getResumePath();
        profile.setResumePath(null);
        CandidateProfile saved = profileRepository.saveAndFlush(profile);

        TransactionUtil.afterCommit(() -> resumeFileCleaner.deleteIfUnreferenced(oldResume));
        return ProfileMapper.toResponse(saved);
    }

    private CandidateProfile getOrCreate(Long userId) {
        return profileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            return profileRepository.save(CandidateProfile.builder().user(user).build());
        });
    }
}