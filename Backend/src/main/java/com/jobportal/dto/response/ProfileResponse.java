package com.jobportal.dto.response;

/** id is null until the candidate saves the profile for the first time. */
public record ProfileResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String phone,
        String location,
        String skills,
        String experience,
        String education,
        String resumeUrl
) {
}