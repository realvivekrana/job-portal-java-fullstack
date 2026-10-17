package com.jobportal.service.impl;

import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.service.FileStorageService;
import com.jobportal.util.FileUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Set;
import java.util.TreeSet;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageServiceImpl.class);

    private static final Set<String> RESUME_EXTENSIONS = Set.of("pdf", "doc", "docx");
    private static final Set<String> LOGO_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp");

    private final Path resumeDir;
    private final Path logoDir;

    public FileStorageServiceImpl(@Value("${app.upload.resume-dir:uploads/resumes}") String resumeDir,
                                  @Value("${app.upload.logo-dir:uploads/logos}") String logoDir) {
        this.resumeDir = prepare(resumeDir);
        this.logoDir = prepare(logoDir);
    }

    @Override
    public String store(MultipartFile file, Category category) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        String ext = FileUtil.extension(file.getOriginalFilename());
        Set<String> allowed = category == Category.RESUME ? RESUME_EXTENSIONS : LOGO_EXTENSIONS;
        if (!allowed.contains(ext)) {
            throw new BadRequestException("Allowed file types: " + String.join(", ", new TreeSet<>(allowed)));
        }

        try {
            byte[] data = file.getBytes();
            if (!FileUtil.matchesSignature(ext, data)) {
                throw new BadRequestException("File content does not match its extension");
            }
            String filename = FileUtil.randomName(ext);
            Path target = dirFor(category).resolve(filename).normalize();
            Files.write(target, data, StandardOpenOption.CREATE_NEW);
            return filename;
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store file", e);
        }
    }

    @Override
    public Resource load(Category category, String filename) {
        if (!FileUtil.isSafeFilename(filename)) {
            throw new ResourceNotFoundException("File not found");
        }
        Path dir = dirFor(category);
        Path file = dir.resolve(filename).normalize();
        if (!file.startsWith(dir) || !Files.isRegularFile(file)) {
            throw new ResourceNotFoundException("File not found");
        }
        return new FileSystemResource(file);
    }

    @Override
    public void delete(Category category, String filename) {
        if (!FileUtil.isSafeFilename(filename)) {
            return;
        }
        Path dir = dirFor(category);
        Path file = dir.resolve(filename).normalize();
        if (!file.startsWith(dir)) {
            return;
        }
        try {
            Files.deleteIfExists(file);
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", file, e.getMessage());
        }
    }

    private Path dirFor(Category category) {
        return category == Category.RESUME ? resumeDir : logoDir;
    }

    private Path prepare(String dir) {
        Path path = Paths.get(dir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory " + path, e);
        }
        return path;
    }
}