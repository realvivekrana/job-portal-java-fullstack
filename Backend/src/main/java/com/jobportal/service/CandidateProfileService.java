package com.jobportal.service;

import com.jobportal.dto.request.ProfileRequest;
import com.jobportal.dto.response.ProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CandidateProfileService {

    /** Returns the profile; an empty one is created on first call. */
    ProfileResponse getMine(Long userId);

    ProfileResponse update(Long userId, ProfileRequest request);

    ProfileResponse uploadResume(Long userId, MultipartFile file);

    ProfileResponse removeResume(Long userId);
}