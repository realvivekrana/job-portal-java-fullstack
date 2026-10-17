package com.jobportal.service.impl;

import com.jobportal.dto.response.JobResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.entity.ApplicationStatus;
import com.jobportal.entity.Job;
import com.jobportal.entity.Role;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.mapper.JobMapper;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.AdminService;
import com.jobportal.service.ResumeFileCleaner;
import com.jobportal.util.Constants;
import com.jobportal.util.TextUtil;
import com.jobportal.util.TransactionUtil;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ResumeFileCleaner resumeFileCleaner;

    public AdminServiceImpl(UserRepository userRepository,
                            JobRepository jobRepository,
                            ApplicationRepository applicationRepository,
                            ResumeFileCleaner resumeFileCleaner) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.resumeFileCleaner = resumeFileCleaner;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> stats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("candidates", userRepository.countByRole(Role.CANDIDATE));
        stats.put("recruiters", userRepository.countByRole(Role.RECRUITER));
        stats.put("admins", userRepository.countByRole(Role.ADMIN));
        stats.put("totalJobs", jobRepository.count());
        stats.put("activeJobs", jobRepository.countByActive(true));
        stats.put("totalApplications", applicationRepository.count());
        for (ApplicationStatus s : ApplicationStatus.values()) {
            stats.put(s.name().toLowerCase(Locale.ROOT), applicationRepository.countByStatus(s));
        }
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<JobResponse> jobs(String keyword, Boolean active, int page, int size) {
        Specification<Job> spec = (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (active != null) {
                p.add(cb.equal(root.get("active"), active));
            }
            if (TextUtil.hasText(keyword)) {
                String like = TextUtil.likePattern(keyword);
                p.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like, '\\'),
                        cb.like(cb.lower(root.get("location")), like, '\\'),
                        cb.like(cb.lower(root.join("company", JoinType.LEFT).get("name")), like, '\\')));
            }
            return cb.and(p.toArray(new Predicate[0]));
        };

        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), Constants.MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Job> result = jobRepository.findAll(spec, pageable);
        return PageResponse.from(result.map(JobMapper::toResponse));
    }

    @Override
    @Transactional
    public JobResponse setJobActive(Long jobId, boolean active) {
        Job job = findJob(jobId);
        job.setActive(active);
        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId) {
        Job job = findJob(jobId);

        List<String> resumePaths = applicationRepository.findResumePathsByJobId(jobId).stream()
                .distinct()
                .toList();
        applicationRepository.deleteByJobId(jobId);
        jobRepository.delete(job);

        TransactionUtil.afterCommit(() -> resumePaths.forEach(resumeFileCleaner::deleteIfUnreferenced));
    }

    private Job findJob(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + jobId));
    }
}