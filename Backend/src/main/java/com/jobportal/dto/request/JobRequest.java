package com.jobportal.dto.request;

import com.jobportal.entity.JobType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record JobRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be at most 150 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 10000, message = "Description is too long")
        String description,

        @NotBlank(message = "Location is required")
        @Size(max = 100, message = "Location must be at most 100 characters")
        String location,

        @PositiveOrZero(message = "Minimum salary cannot be negative")
        Double salaryMin,

        @PositiveOrZero(message = "Maximum salary cannot be negative")
        Double salaryMax,

        @NotNull(message = "Job type is required (FULL_TIME, PART_TIME, INTERNSHIP, REMOTE, CONTRACT)")
        JobType jobType,

        @Size(max = 500, message = "Skills must be at most 500 characters (comma separated)")
        String skills,

        @Min(value = 0, message = "Experience cannot be negative")
        @Max(value = 50, message = "Experience must be 50 years or less")
        Integer experienceRequired
) {
}