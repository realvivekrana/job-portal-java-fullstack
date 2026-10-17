package com.jobportal.dto.response;

import com.jobportal.entity.ApplicationStatus;

import java.time.LocalDateTime;

public record ApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String companyName,
        Long candidateId,
        String candidateName,
        String candidateEmail,
        String resumeUrl,
        String coverLetter,
        ApplicationStatus status,
        LocalDateTime appliedAt
) {
}