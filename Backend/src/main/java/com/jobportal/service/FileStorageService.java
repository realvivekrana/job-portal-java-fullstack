package com.jobportal.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    enum Category {
        RESUME,
        LOGO
    }

    /** Validates and saves the file. Returns the stored file name (uuid.ext). */
    String store(MultipartFile file, Category category);

    Resource load(Category category, String filename);

    void delete(Category category, String filename);
}