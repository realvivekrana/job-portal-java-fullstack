package com.jobportal.util;

import java.util.Set;

public final class Constants {

    private Constants() {
    }

    public static final int MAX_PAGE_SIZE = 50;

    /** Keep in sync with spring.servlet.multipart.max-file-size in application.properties. */
    public static final long MAX_RESUME_SIZE_BYTES = 5L * 1024 * 1024;

    public static final Set<String> ALLOWED_RESUME_EXTENSIONS = Set.of("pdf", "doc", "docx");

    /** Resume URL = this prefix + stored file name. Served by FileController (needs the JWT header). */
    public static final String RESUME_URL_PREFIX = "/api/files/resumes/";
}