package com.jobportal.service.impl;

import com.jobportal.dto.request.ApplicationRequest;
import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.entity.Application;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.DuplicateResourceException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.mapper.ApplicationMapper;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.CandidateProfileRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.ApplicationService;
import com.jobportal.util.Constants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;

    public ApplicationServiceImpl(ApplicationRepository applicationRepository,
                                  JobRepository jobRepository,
                                  UserRepository userRepository,
                                  CandidateProfileRepository profileRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    @Transactional
    public ApplicationResponse apply(Long candidateId, ApplicationRequest request) {
        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + request.jobId()));
        if (!job.isActive()) {
            throw new BadRequestException("This job is closed and no longer accepts applications");
        }
        if (applicationRepository.existsByJobIdAndCandidateId(job.getId(), candidateId)) {
            throw new DuplicateResourceException("You have already applied to this job");
        }

        // The application keeps the resume that is on the profile right now.
        CandidateProfile profile = profileRepository.findByUserId(candidateId)
                .filter(p -> p.getResumePath() != null)
                .orElseThrow(() -> new BadRequestException("Upload your resume in your profile before applying"));

        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resumePath(profile.getResumePath())
                .coverLetter(clean(request.coverLetter()))
                .build();

        return ApplicationMapper.toResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> myApplications(Long candidateId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), Constants.MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<Application> result = applicationRepository.findByCandidateId(candidateId, pageable);
        return PageResponse.from(result.map(ApplicationMapper::toResponse));
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}