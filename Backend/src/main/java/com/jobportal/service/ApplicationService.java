package com.jobportal.service;

import com.jobportal.dto.request.ApplicationRequest;
import com.jobportal.dto.request.StatusUpdateRequest;
import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.entity.ApplicationStatus;
import com.jobportal.entity.Role;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface ApplicationService {

    /** Resume file is optional: if missing, the resume saved in the candidate profile is used. */
    ApplicationResponse apply(Long candidateId, Long jobId, ApplicationRequest request, MultipartFile resume);

    PageResponse<ApplicationResponse> myApplications(Long candidateId, int page, int size);

    /** Applicants of one job. Only the recruiter who posted the job can see them. Status filter is optional. */
    PageResponse<ApplicationResponse> forJob(Long recruiterId, Long jobId, ApplicationStatus status, int page, int size);

    ApplicationResponse getById(Long userId, Role role, Long applicationId);

    ApplicationResponse updateStatus(Long recruiterId, Long applicationId, StatusUpdateRequest request);

    /** Candidate withdraws an application that is still in APPLIED status. */
    void withdraw(Long candidateId, Long applicationId);

    Map<String, Long> candidateStats(Long candidateId);

    Map<String, Long> recruiterStats(Long recruiterId);

    /** Resume files are private: owner, the recruiter of the job applied to, or an admin. */
    boolean canViewResume(Long userId, Role role, String filename);
}