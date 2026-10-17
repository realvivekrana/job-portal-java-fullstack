package com.jobportal.mapper;

import com.jobportal.dto.response.JobResponse;
import com.jobportal.entity.Job;

public final class JobMapper {

    private JobMapper() {
    }

    /** Call inside a transaction: company is loaded lazily. */
    public static JobResponse toResponse(Job j) {
        return new JobResponse(
                j.getId(),
                j.getTitle(),
                j.getDescription(),
                j.getLocation(),
                j.getSalaryMin(),
                j.getSalaryMax(),
                j.getJobType(),
                j.getSkills(),
                j.getExperienceRequired(),
                j.isActive(),
                j.getCompany().getId(),
                j.getCompany().getName(),
                j.getPostedBy().getId(),
                j.getCreatedAt());
    }
}