package com.jobportal.service;

import com.jobportal.dto.request.ProfileRequest;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.entity.Role;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface CandidateProfileService {

    /** Returns an empty profile (id = null) if the candidate has not saved one yet. */
    ProfileResponse getMine(Long userId);

    /** Creates the profile on first save, updates it afterwards. */
    ProfileResponse saveMine(Long userId, ProfileRequest request);

    ProfileResponse uploadResume(Long userId, MultipartFile file);

    /**
     * Resume download with access check: the owner, the recruiter whose job the candidate
     * applied to, or an admin.
     */
    Resource loadResume(Long requesterId, Role requesterRole, String filename);
}