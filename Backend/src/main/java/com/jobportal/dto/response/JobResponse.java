package com.jobportal.dto.response;

import com.jobportal.entity.JobType;

import java.time.LocalDateTime;

public record JobResponse(
        Long id,
        String title,
        String description,
        String location,
        Double salaryMin,
        Double salaryMax,
        JobType jobType,
        String skills,
        Integer experienceRequired,
        boolean active,
        Long companyId,
        String companyName,
        Long postedById,
        LocalDateTime createdAt
) {
}