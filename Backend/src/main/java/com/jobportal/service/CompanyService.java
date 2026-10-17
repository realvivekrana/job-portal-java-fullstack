package com.jobportal.service;

import com.jobportal.dto.request.CompanyRequest;
import com.jobportal.dto.response.CompanyResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CompanyService {

    CompanyResponse create(Long recruiterId, CompanyRequest request);

    CompanyResponse update(Long recruiterId, CompanyRequest request);

    CompanyResponse getMine(Long recruiterId);

    CompanyResponse getById(Long id);

    /** Replaces the company logo (png, jpg or webp). */
    CompanyResponse uploadLogo(Long recruiterId, MultipartFile file);
}