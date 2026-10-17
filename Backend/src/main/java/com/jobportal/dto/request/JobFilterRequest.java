package com.jobportal.dto.request;

import com.jobportal.entity.JobType;

/** Search filters for GET /api/jobs. Every field is optional. */
public record JobFilterRequest(
        String keyword,
        String location,
        JobType jobType,
        Double minSalary,
        Integer maxExperience
) {
}