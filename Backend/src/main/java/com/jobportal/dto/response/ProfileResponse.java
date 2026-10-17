package com.jobportal.dto.response;

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