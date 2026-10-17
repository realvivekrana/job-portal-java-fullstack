package com.jobportal.util;

import java.util.Arrays;
import java.util.Locale;
import java.util.regex.Pattern;

public final class FileUtil {

    /** Stored resumes are always "<uuid>.<pdf|doc|docx>". Anything else is rejected (blocks path traversal). */
    private static final Pattern STORED_NAME = Pattern.compile(
            "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(pdf|doc|docx)$");

    private static final byte[] PDF_MAGIC = {'%', 'P', 'D', 'F'};
    private static final byte[] ZIP_MAGIC = {'P', 'K', 3, 4}; // docx is a zip
    private static final byte[] OLE_MAGIC = {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0,
            (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1}; // legacy .doc

    private FileUtil() {
    }

    /** Lower-case extension without the dot, or "" if there is none. */
    public static String extension(String filename) {
        if (filename == null) {
            return "";
        }
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    public static boolean isSafeStoredName(String name) {
        return name != null && STORED_NAME.matcher(name).matches();
    }

    /** The extension and Content-Type are client controlled, so also check the file's first bytes. */
    public static boolean matchesSignature(String ext, byte[] head) {
        return switch (ext) {
            case "pdf" -> startsWith(head, PDF_MAGIC);
            case "docx" -> startsWith(head, ZIP_MAGIC);
            case "doc" -> startsWith(head, OLE_MAGIC);
            default -> false;
        };
    }

    public static String contentTypeFor(String ext) {
        return switch (ext) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default -> "application/octet-stream";
        };
    }

    /** null in, null out, so DTOs simply show "no resume". */
    public static String resumeUrl(String storedName) {
        return storedName == null ? null : Constants.RESUME_URL_PREFIX + storedName;
    }

    private static boolean startsWith(byte[] head, byte[] magic) {
        return head != null && head.length >= magic.length
                && Arrays.equals(Arrays.copyOf(head, magic.length), magic);
    }
}