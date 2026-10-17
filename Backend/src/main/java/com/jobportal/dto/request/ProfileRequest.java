package com.jobportal.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Every field is optional: a candidate can fill the profile bit by bit. PUT replaces all of them. */
public record ProfileRequest(
        @Pattern(regexp = "^$|^\\+?[0-9\\s-]{7,20}$",
                message = "Phone must be 7 to 20 digits and may start with +")
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