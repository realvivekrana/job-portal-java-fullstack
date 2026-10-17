package com.jobportal.mapper;

import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.entity.Application;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.util.Constants;

public final class ApplicationMapper {

    private ApplicationMapper() {
    }

    /** Call inside a transaction: job, company and candidate are loaded lazily. Profile may be null. */
    public static ApplicationResponse toResponse(Application a, CandidateProfile profile) {
        Job job = a.getJob();
        User candidate = a.getCandidate();

        ApplicationResponse.CandidateInfo info = new ApplicationResponse.CandidateInfo(
                candidate.getId(),
                candidate.getName(),
                candidate.getEmail(),
                profile == null ? null : profile.getPhone(),
                profile == null ? null : profile.getLocation(),
                profile == null ? null : profile.getSkills(),
                profile == null ? null : profile.getExperience(),
                profile == null ? null : profile.getEducation());

        return new ApplicationResponse(
                a.getId(),
                job.getId(),
                job.getTitle(),
                job.getLocation(),
                job.getJobType(),
                job.getCompany().getId(),
                job.getCompany().getName(),
                info,
                a.getCoverLetter(),
                a.getResumePath() == null ? null : Constants.RESUME_URL_PREFIX + a.getResumePath(),
                a.getStatus(),
                a.getAppliedAt());
    }
}