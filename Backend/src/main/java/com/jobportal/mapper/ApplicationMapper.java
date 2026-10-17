package com.jobportal.mapper;

import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.util.FileUtil;

public final class ApplicationMapper {

    private ApplicationMapper() {
    }

    /** Call inside a transaction: job, company and candidate are loaded lazily. */
    public static ApplicationResponse toResponse(Application a) {
        Job job = a.getJob();
        User candidate = a.getCandidate();
        return new ApplicationResponse(
                a.getId(),
                job.getId(),
                job.getTitle(),
                job.getCompany().getName(),
                candidate.getId(),
                candidate.getName(),
                candidate.getEmail(),
                FileUtil.resumeUrl(a.getResumePath()),
                a.getCoverLetter(),
                a.getStatus(),
                a.getAppliedAt());
    }
}