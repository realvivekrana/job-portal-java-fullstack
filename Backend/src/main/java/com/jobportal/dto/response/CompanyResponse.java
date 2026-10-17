package com.jobportal.dto.response;

import java.time.LocalDateTime;

public record CompanyResponse(
        Long id,
        String name,
        String description,
        String website,
        String location,
        String logo,
        Long recruiterId,
        LocalDateTime createdAt
) {
}