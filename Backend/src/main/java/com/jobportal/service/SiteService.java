package com.jobportal.service;

import com.jobportal.dto.response.PublicOverview;

import java.util.Map;

public interface SiteService {

    /** All site texts: stored values, with defaults for anything the admin has not changed. */
    Map<String, String> getSettings();

    /** Saves the given texts. A blank value restores that text's default. Unknown keys are rejected. */
    Map<String, String> updateSettings(Map<String, String> updates);

    /** Live stats, job type counts, popular searches and top hiring companies (cached for a minute). */
    PublicOverview overview();
}