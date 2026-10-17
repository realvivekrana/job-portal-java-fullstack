package com.jobportal.service;

import com.jobportal.dto.response.JobResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.SavedJob;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.mapper.JobMapper;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.SavedJobRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public SavedJobService(SavedJobRepository savedJobRepository,
                           JobRepository jobRepository,
                           UserRepository userRepository) {
        this.savedJobRepository = savedJobRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    /** Saving the same job twice is harmless: the second call does nothing. */
    @Transactional
    public void save(Long candidateId, Long jobId) {
        if (savedJobRepository.existsByJobIdAndCandidateId(jobId, candidateId)) {
            return;
        }
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + jobId));
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        savedJobRepository.save(SavedJob.builder().job(job).candidate(candidate).build());
    }

    @Transactional
    public void remove(Long candidateId, Long jobId) {
        savedJobRepository.findByJobIdAndCandidateId(jobId, candidateId).ifPresent(savedJobRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<Long> savedIds(Long candidateId) {
        return savedJobRepository.findJobIdsByCandidateId(candidateId);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobResponse> list(Long candidateId, int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Direction.DESC, "savedAt"));
        return PageResponse.from(savedJobRepository.findDetailedByCandidateId(candidateId, pageable)
                .map(s -> JobMapper.toResponse(s.getJob())));
    }
}