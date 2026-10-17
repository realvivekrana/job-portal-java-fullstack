package com.jobportal.service;

import com.jobportal.dto.request.CompanyRequest;
import com.jobportal.dto.response.CompanyResponse;

public interface CompanyService {

    CompanyResponse create(Long recruiterId, CompanyRequest request);

    CompanyResponse update(Long recruiterId, CompanyRequest request);

    CompanyResponse getMine(Long recruiterId);

    CompanyResponse getById(Long id);
}