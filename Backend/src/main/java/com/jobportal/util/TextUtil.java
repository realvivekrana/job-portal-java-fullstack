package com.jobportal.util;

import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

public final class TextUtil {

    private TextUtil() {
    }

    public static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    /** Trims; blank becomes null. */
    public static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** "Java , Spring,,MySQL " becomes "Java,Spring,MySQL". Blank becomes null. */
    public static String normalizeCsv(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String joined = Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(","));
        return joined.isEmpty() ? null : joined;
    }

    /** Lower-cased %text% pattern for LIKE ... ESCAPE '\'. */
    public static String likePattern(String text) {
        String escaped = text.trim().toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }
}