package com.jobportal.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApplicationRequest(
        @NotNull(message = "Job id is required")
        Long jobId,

        @Size(max = 5000, message = "Cover letter must be at most 5000 characters")
        String coverLetter
) {
}