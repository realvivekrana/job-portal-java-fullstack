package com.jobportal.service.impl;

import com.jobportal.dto.request.JobFilterRequest;
import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.entity.Company;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.mapper.JobMapper;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.JobService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    private static final Set<String> SORTABLE =
            Set.of("createdAt", "title", "salaryMin", "salaryMax", "experienceRequired");
    private static final int MAX_PAGE_SIZE = 50;

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public JobServiceImpl(JobRepository jobRepository,
                          CompanyRepository companyRepository,
                          UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public JobResponse create(Long recruiterId, JobRequest request) {
        validateSalary(request);

        Company company = companyRepository.findByRecruiterId(recruiterId)
                .orElseThrow(() -> new BadRequestException("Create your company profile before posting a job"));
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Job job = Job.builder()
                .title(request.title().trim())
                .description(request.description().trim())
                .location(request.location().trim())
                .salaryMin(request.salaryMin())
                .salaryMax(request.salaryMax())
                .jobType(request.jobType())
                .skills(normalizeSkills(request.skills()))
                .experienceRequired(request.experienceRequired())
                .company(company)
                .postedBy(recruiter)
                .build();

        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public JobResponse update(Long recruiterId, Long jobId, JobRequest request) {
        validateSalary(request);
        Job job = findOwnedJob(recruiterId, jobId);

        job.setTitle(request.title().trim());
        job.setDescription(request.description().trim());
        job.setLocation(request.location().trim());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());
        job.setJobType(request.jobType());
        job.setSkills(normalizeSkills(request.skills()));
        job.setExperienceRequired(request.experienceRequired());

        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public JobResponse setActive(Long recruiterId, Long jobId, boolean active) {
        Job job = findOwnedJob(recruiterId, jobId);
        job.setActive(active);
        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .filter(Job::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + jobId));
        return JobMapper.toResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<JobResponse> search(JobFilterRequest filter, int page, int size,
                                            String sortBy, String sortDir) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        Page<Job> result = jobRepository.findAll(buildSpec(filter), pageable);
        return PageResponse.from(result.map(JobMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<JobResponse> myJobs(Long recruiterId, int page, int size) {
        Pageable pageable = buildPageable(page, size, "createdAt", "desc");
        Page<Job> result = jobRepository.findByPostedById(recruiterId, pageable);
        return PageResponse.from(result.map(JobMapper::toResponse));
    }

    // ---------------- helpers ----------------

    private Job findOwnedJob(Long recruiterId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + jobId));
        if (!job.getPostedBy().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You can change only the jobs you posted");
        }
        return job;
    }

    private void validateSalary(JobRequest r) {
        if (r.salaryMin() != null && r.salaryMax() != null && r.salaryMin() > r.salaryMax()) {
            throw new BadRequestException("Minimum salary cannot be greater than maximum salary");
        }
    }

    private String normalizeSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return null;
        }
        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(","));
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (!SORTABLE.contains(sortBy)) {
            throw new BadRequestException("sortBy must be one of " + SORTABLE);
        }
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(direction, sortBy));
    }

    /** Only active jobs, plus whichever filters were given. */
    private Specification<Job> buildSpec(JobFilterRequest f) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            p.add(cb.isTrue(root.get("active")));

            if (f != null) {
                if (hasText(f.keyword())) {
                    String like = "%" + escape(f.keyword().trim().toLowerCase(Locale.ROOT)) + "%";
                    p.add(cb.or(
                            cb.like(cb.lower(root.get("title")), like, '\\'),
                            cb.like(cb.lower(root.get("skills")), like, '\\'),
                            cb.like(cb.lower(root.get("description")), like, '\\')));
                }
                if (hasText(f.location())) {
                    String like = "%" + escape(f.location().trim().toLowerCase(Locale.ROOT)) + "%";
                    p.add(cb.like(cb.lower(root.get("location")), like, '\\'));
                }
                if (f.jobType() != null) {
                    p.add(cb.equal(root.get("jobType"), f.jobType()));
                }
                if (f.minSalary() != null) {
                    p.add(cb.greaterThanOrEqualTo(root.<Double>get("salaryMax"), f.minSalary()));
                }
                if (f.maxExperience() != null) {
                    p.add(cb.or(
                            cb.isNull(root.get("experienceRequired")),
                            cb.lessThanOrEqualTo(root.<Integer>get("experienceRequired"), f.maxExperience())));
                }
            }
            return cb.and(p.toArray(new Predicate[0]));
        };
    }

    private boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private String escape(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}