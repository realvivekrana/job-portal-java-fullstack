package com.jobportal.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileRequest(
        @Pattern(regexp = "^$|^[0-9+()\\-\\s]{7,20}$", message = "Phone number is not valid")
        String phone,

        @Size(max = 255, message = "Location must be at most 255 characters")
        String location,

        @Size(max = 500, message = "Skills must be at most 500 characters (comma separated)")
        String skills,

        @Size(max = 5000, message = "Experience must be at most 5000 characters")
        String experience,

        @Size(max = 5000, message = "Education must be at most 5000 characters")
        String education
) {
}