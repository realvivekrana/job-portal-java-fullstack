package com.jobportal.util;

public final class Constants {

    private Constants() {
    }

    /** Public URL prefixes the frontend uses to fetch uploaded files. */
    public static final String RESUME_URL_PREFIX = "/api/files/resumes/";
    public static final String LOGO_URL_PREFIX = "/api/files/logos/";

    public static final int MAX_PAGE_SIZE = 50;
    public static final int MAX_COVER_LETTER_LENGTH = 5000;
}