package com.jobportal.mapper;

import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.User;
import com.jobportal.util.Constants;

public final class ProfileMapper {

    private ProfileMapper() {
    }

    /** Call inside a transaction: user is loaded lazily. */
    public static ProfileResponse toResponse(CandidateProfile p) {
        User u = p.getUser();
        return new ProfileResponse(
                p.getId(),
                u.getId(),
                u.getName(),
                u.getEmail(),
                p.getPhone(),
                p.getLocation(),
                p.getSkills(),
                p.getExperience(),
                p.getEducation(),
                p.getResumePath() == null ? null : Constants.RESUME_URL_PREFIX + p.getResumePath());
    }
}