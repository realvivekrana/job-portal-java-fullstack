package com.jobportal.service.impl;

import com.jobportal.dto.response.PublicOverview;
import com.jobportal.entity.JobType;
import com.jobportal.entity.Role;
import com.jobportal.entity.SiteSetting;
import com.jobportal.exception.BadRequestException;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.SiteSettingRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.SiteService;
import com.jobportal.util.Constants;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SiteServiceImpl implements SiteService {

    private static final int MAX_VALUE_LENGTH = 2000;
    private static final long OVERVIEW_CACHE_MS = 60_000;
    private static final int POPULAR_LIMIT = 6;
    private static final int TOP_COMPANIES = 6;

    /** Every editable text and its default. Multi-line lists use one item per line. */
    private static final Map<String, String> DEFAULTS = new LinkedHashMap<>();

    static {
        DEFAULTS.put("siteName", "JobPortal");
        DEFAULTS.put("siteTagline", "Find jobs. Hire talent.");
        DEFAULTS.put("heroTitle", "Find your next job");
        DEFAULTS.put("heroLead", "Search openings from companies that are hiring now, apply in a couple of taps and follow every application in one place.");
        DEFAULTS.put("candidatePoints", "Filter by skill, location, job type and salary\nApply with a saved resume and a short cover letter\nTrack every application from applied to hired");
        DEFAULTS.put("recruiterPoints", "Create your company page and post jobs in minutes\nReview applicants and open resumes in one click\nShortlist, hire or reject with automatic email updates");
        DEFAULTS.put("ctaTitle", "Ready to get started?");
        DEFAULTS.put("ctaText", "Join as a candidate to apply, or as a recruiter to start hiring.");
        DEFAULTS.put("authHeadline", "Your next role, or your next hire, starts here.");
        DEFAULTS.put("authPoints", "Search openings and apply with one saved resume\nPost jobs and shortlist applicants in one place\nGet email updates when your application status changes");
        DEFAULTS.put("footerAbout", "A simple place for candidates to find the right job and for recruiters to hire the right people.");
        DEFAULTS.put("footerNote", "Made in India");
        DEFAULTS.put("contactEmail", "");
    }

    private final SiteSettingRepository settingRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    private volatile PublicOverview cachedOverview;
    private volatile long cachedAt;

    public SiteServiceImpl(SiteSettingRepository settingRepository,
                           JobRepository jobRepository,
                           UserRepository userRepository,
                           ApplicationRepository applicationRepository) {
        this.settingRepository = settingRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    // ---------------- site texts ----------------

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getSettings() {
        Map<String, String> result = new LinkedHashMap<>(DEFAULTS);
        for (SiteSetting s : settingRepository.findAll()) {
            String value = s.getSettingValue();
            if (DEFAULTS.containsKey(s.getSettingKey()) && value != null && !value.isBlank()) {
                result.put(s.getSettingKey(), value);
            }
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, String> updateSettings(Map<String, String> updates) {
        if (updates == null || updates.isEmpty()) {
            throw new BadRequestException("Nothing to update");
        }
        // validate everything first so a bad value does not leave a half-saved change
        Map<String, String> cleaned = new LinkedHashMap<>();
        for (Map.Entry<String, String> e : updates.entrySet()) {
            String key = e.getKey();
            if (!DEFAULTS.containsKey(key)) {
                throw new BadRequestException("Unknown setting: " + key);
            }
            String value = e.getValue() == null ? "" : e.getValue().replace("\r\n", "\n").trim();
            if (value.length() > MAX_VALUE_LENGTH) {
                throw new BadRequestException(key + " must be at most " + MAX_VALUE_LENGTH + " characters");
            }
            if ("contactEmail".equals(key) && !value.isEmpty() && !value.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                throw new BadRequestException("Contact email is not valid");
            }
            cleaned.put(key, value);
        }

        for (Map.Entry<String, String> e : cleaned.entrySet()) {
            String key = e.getKey();
            String value = e.getValue();
            if (value.isEmpty() || value.equals(DEFAULTS.get(key))) {
                if (settingRepository.existsById(key)) {
                    settingRepository.deleteById(key);
                }
            } else {
                settingRepository.save(new SiteSetting(key, value));
            }
        }
        return getSettings();
    }

    // ---------------- live overview ----------------

    @Override
    @Transactional(readOnly = true)
    public PublicOverview overview() {
        long now = System.currentTimeMillis();
        PublicOverview current = cachedOverview;
        if (current != null && now - cachedAt < OVERVIEW_CACHE_MS) {
            return current;
        }
        PublicOverview fresh = buildOverview();
        cachedOverview = fresh;
        cachedAt = now;
        return fresh;
    }

    private PublicOverview buildOverview() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("openJobs", jobRepository.countByActive(true));
        stats.put("hiringCompanies", jobRepository.countActiveCompanies());
        stats.put("candidates", userRepository.countByRole(Role.CANDIDATE));
        stats.put("applications", applicationRepository.count());

        Map<JobType, Long> counts = new EnumMap<>(JobType.class);
        for (Object[] row : jobRepository.countActiveByJobType()) {
            counts.put((JobType) row[0], ((Number) row[1]).longValue());
        }
        List<PublicOverview.TypeCount> types = new ArrayList<>();
        for (JobType t : JobType.values()) {
            types.add(new PublicOverview.TypeCount(t.name(), counts.getOrDefault(t, 0L)));
        }

        List<String> skillTerms = new ArrayList<>();
        for (String list : jobRepository.findActiveSkills()) {
            for (String s : list.split(",")) {
                skillTerms.add(s);
            }
        }
        List<String> locationTerms = new ArrayList<>();
        for (String loc : jobRepository.findActiveLocations()) {
            // "Pune, Maharashtra" -> "Pune" so the same city groups together
            locationTerms.add(loc.split(",")[0]);
        }

        List<PublicOverview.TopCompany> companies = new ArrayList<>();
        for (Object[] row : jobRepository.topHiringCompanies(PageRequest.of(0, TOP_COMPANIES))) {
            String logo = row[2] == null ? null : Constants.LOGO_URL_PREFIX + row[2];
            companies.add(new PublicOverview.TopCompany(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    logo,
                    (String) row[3],
                    ((Number) row[4]).longValue()));
        }

        return new PublicOverview(stats, types, topTerms(skillTerms, POPULAR_LIMIT),
                topTerms(locationTerms, POPULAR_LIMIT), companies);
    }

    /** Most frequent terms, case-insensitive, most common first. */
    private List<String> topTerms(Collection<String> values, int limit) {
        Map<String, Integer> counts = new HashMap<>();
        Map<String, String> display = new HashMap<>();
        for (String v : values) {
            if (v == null) {
                continue;
            }
            String term = v.trim();
            if (term.isEmpty()) {
                continue;
            }
            String key = term.toLowerCase(Locale.ROOT);
            counts.merge(key, 1, Integer::sum);
            display.putIfAbsent(key, term);
        }
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(counts.entrySet());
        entries.sort((a, b) -> {
            int byCount = Integer.compare(b.getValue(), a.getValue());
            return byCount != 0 ? byCount : a.getKey().compareTo(b.getKey());
        });
        List<String> result = new ArrayList<>();
        for (Map.Entry<String, Integer> e : entries) {
            if (result.size() >= limit) {
                break;
            }
            result.add(display.get(e.getKey()));
        }
        return result;
    }
}