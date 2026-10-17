package com.jobportal.service;

import com.jobportal.dto.request.ApplicationRequest;
import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.dto.response.PageResponse;

public interface ApplicationService {

    ApplicationResponse apply(Long candidateId, ApplicationRequest request);

    PageResponse<ApplicationResponse> myApplications(Long candidateId, int page, int size);
}