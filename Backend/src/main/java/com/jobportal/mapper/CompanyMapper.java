package com.jobportal.mapper;

import com.jobportal.dto.response.CompanyResponse;
import com.jobportal.entity.Company;
import com.jobportal.util.Constants;

public final class CompanyMapper {

    private CompanyMapper() {
    }

    public static CompanyResponse toResponse(Company c) {
        return new CompanyResponse(
                c.getId(),
                c.getName(),
                c.getDescription(),
                c.getWebsite(),
                c.getLocation(),
                c.getLogo() == null ? null : Constants.LOGO_URL_PREFIX + c.getLogo(),
                c.getRecruiter().getId(),
                c.getCreatedAt());
    }
}