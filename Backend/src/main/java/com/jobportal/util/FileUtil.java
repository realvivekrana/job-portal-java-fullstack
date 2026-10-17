package com.jobportal.util;

import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

public final class FileUtil {

    private static final Pattern SAFE_NAME = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$");

    private FileUtil() {
    }

    /** Stored files are named uuid.ext, so anything else (slashes, "..") is rejected. */
    public static boolean isSafeFilename(String name) {
        return name != null && !name.contains("..") && SAFE_NAME.matcher(name).matches();
    }

    public static String extension(String originalName) {
        if (originalName == null) {
            return "";
        }
        String clean = StringUtils.cleanPath(originalName);
        int dot = clean.lastIndexOf('.');
        return dot < 0 ? "" : clean.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    public static String randomName(String ext) {
        return UUID.randomUUID() + "." + ext;
    }

    /** Checks the first bytes of the file so a renamed .exe cannot pass as a .pdf. */
    public static boolean matchesSignature(String ext, byte[] data) {
        return switch (ext) {
            case "pdf" -> startsWith(data, new byte[]{'%', 'P', 'D', 'F'});
            case "docx" -> startsWith(data, new byte[]{'P', 'K', 3, 4});
            case "doc" -> startsWith(data, new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0});
            case "png" -> startsWith(data, new byte[]{(byte) 0x89, 'P', 'N', 'G'});
            case "jpg", "jpeg" -> startsWith(data, new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF});
            case "webp" -> data != null && data.length >= 12
                    && startsWith(data, "RIFF".getBytes(StandardCharsets.US_ASCII))
                    && data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P';
            default -> false;
        };
    }

    public static String contentType(String filename) {
        String ext = extension(filename);
        return switch (ext) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data == null || data.length < prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }
}