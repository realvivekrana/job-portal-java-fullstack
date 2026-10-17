package com.jobportal.dto.response;

import com.jobportal.entity.ApplicationStatus;
import com.jobportal.entity.JobType;

import java.time.LocalDateTime;

public record ApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String jobLocation,
        JobType jobType,
        Long companyId,
        String companyName,
        CandidateInfo candidate,
        String coverLetter,
        String resumeUrl,
        ApplicationStatus status,
        LocalDateTime appliedAt
) {

    /** Phone, location, skills, experience and education are null when the candidate has no profile yet. */
    public record CandidateInfo(
            Long id,
            String name,
            String email,
            String phone,
            String location,
            String skills,
            String experience,
            String education
    ) {
    }
}