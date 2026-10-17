package com.jobportal.dto.response;

import java.util.List;
import java.util.Map;

/** Live numbers for the public home page. Nothing here is personal data. */
public record PublicOverview(
        Map<String, Long> stats,
        List<TypeCount> jobTypes,
        List<String> popularSkills,
        List<String> popularLocations,
        List<TopCompany> topCompanies
) {
    public record TypeCount(String type, long count) {
    }

    public record TopCompany(Long id, String name, String logo, String location, long openJobs) {
    }
}