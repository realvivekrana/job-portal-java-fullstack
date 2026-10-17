package com.jobportal.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /** Validates and saves a resume. Returns the stored file name (not a full path). */
    String storeResume(MultipartFile file);

    Resource loadResume(String storedName);

    /** Deletes the file if it exists. A missing file is not an error. */
    void deleteResume(String storedName);
}