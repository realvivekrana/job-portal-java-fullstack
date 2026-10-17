package com.jobportal.dto.request;

import com.jobportal.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required (SHORTLISTED, REJECTED, HIRED)")
        ApplicationStatus status
) {
}