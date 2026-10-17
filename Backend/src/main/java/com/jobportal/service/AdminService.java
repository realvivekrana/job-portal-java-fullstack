package com.jobportal.service;

import com.jobportal.dto.response.JobResponse;
import com.jobportal.dto.response.PageResponse;

import java.util.Map;

public interface AdminService {

    Map<String, Long> stats();

    /** All jobs, including closed ones. Both filters are optional. */
    PageResponse<JobResponse> jobs(String keyword, Boolean active, int page, int size);

    JobResponse setJobActive(Long jobId, boolean active);

    /** Deletes the job together with all its applications. */
    void deleteJob(Long jobId);
}