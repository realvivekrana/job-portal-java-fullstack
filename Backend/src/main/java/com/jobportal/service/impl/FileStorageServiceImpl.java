package com.jobportal.service.impl;

import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.service.FileStorageService;
import com.jobportal.util.Constants;
import com.jobportal.util.FileUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageServiceImpl.class);

    private final Path resumeDir;

    public FileStorageServiceImpl(@Value("${app.upload.resume-dir:uploads/resumes}") String resumeDir) {
        this.resumeDir = Paths.get(resumeDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.resumeDir);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory " + this.resumeDir, e);
        }
    }

    @Override
    public String storeResume(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose a resume file to upload");
        }
        if (file.getSize() > Constants.MAX_RESUME_SIZE_BYTES) {
            throw new BadRequestException("Resume must be 5 MB or smaller");
        }

        String ext = FileUtil.extension(file.getOriginalFilename());
        if (!Constants.ALLOWED_RESUME_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Only PDF, DOC or DOCX resumes are allowed");
        }

        // The user's file name is never used on disk, so it cannot escape the upload folder.
        String storedName = UUID.randomUUID() + "." + ext;
        Path target = resumeDir.resolve(storedName).normalize();

        try {
            byte[] head;
            try (InputStream in = file.getInputStream()) {
                head = in.readNBytes(8);
            }
            if (!FileUtil.matchesSignature(ext, head)) {
                throw new BadRequestException("File content does not match its ." + ext + " extension");
            }
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target);
            }
        } catch (IOException e) {
            log.error("Could not store resume {}", storedName, e);
            throw new IllegalStateException("Could not store the file", e);
        }
        return storedName;
    }

    @Override
    public Resource loadResume(String storedName) {
        if (!FileUtil.isSafeStoredName(storedName)) {
            throw new ResourceNotFoundException("File not found");
        }
        Path file = resumeDir.resolve(storedName).normalize();
        if (!file.startsWith(resumeDir) || !Files.isReadable(file)) {
            throw new ResourceNotFoundException("File not found");
        }
        return new FileSystemResource(file);
    }

    @Override
    public void deleteResume(String storedName) {
        if (!FileUtil.isSafeStoredName(storedName)) {
            return;
        }
        try {
            Files.deleteIfExists(resumeDir.resolve(storedName).normalize());
        } catch (IOException e) {
            log.warn("Could not delete resume {}: {}", storedName, e.getMessage());
        }
    }
}