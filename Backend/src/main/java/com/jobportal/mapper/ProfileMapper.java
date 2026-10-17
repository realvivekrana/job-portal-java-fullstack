package com.jobportal.mapper;

import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.User;
import com.jobportal.util.FileUtil;

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
                FileUtil.resumeUrl(p.getResumePath()));
    }

    /** For a candidate who has not saved a profile yet. */
    public static ProfileResponse empty(User u) {
        return new ProfileResponse(null, u.getId(), u.getName(), u.getEmail(),
                null, null, null, null, null, null);
    }
}