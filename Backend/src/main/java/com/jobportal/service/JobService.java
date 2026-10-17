package com.jobportal.service;

import com.jobportal.dto.request.JobFilterRequest;
import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.dto.response.PageResponse;

public interface JobService {

    JobResponse create(Long recruiterId, JobRequest request);

    JobResponse update(Long recruiterId, Long jobId, JobRequest request);

    JobResponse setActive(Long recruiterId, Long jobId, boolean active);

    JobResponse getById(Long jobId);

    PageResponse<JobResponse> search(JobFilterRequest filter, int page, int size, String sortBy, String sortDir);

    PageResponse<JobResponse> myJobs(Long recruiterId, int page, int size);
}