package com.jobportal.dto.request;

import jakarta.validation.constraints.Size;

/** Text part of the apply form (sent as multipart/form-data together with the optional resume file). */
public record ApplicationRequest(
        @Size(max = 5000, message = "Cover letter must be at most 5000 characters")
        String coverLetter
) {
}