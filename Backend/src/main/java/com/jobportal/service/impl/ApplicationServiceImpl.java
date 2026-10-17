package com.jobportal.service.impl;

import com.jobportal.dto.request.ApplicationRequest;
import com.jobportal.dto.request.StatusUpdateRequest;
import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.dto.response.PageResponse;
import com.jobportal.entity.Application;
import com.jobportal.entity.ApplicationStatus;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.Job;
import com.jobportal.entity.Role;
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
import com.jobportal.service.EmailService;
import com.jobportal.service.FileStorageService;
import com.jobportal.service.ResumeFileCleaner;
import com.jobportal.util.Constants;
import com.jobportal.util.TextUtil;
import com.jobportal.util.TransactionUtil;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    /** Recruiter can move an application forward only. HIRED and REJECTED are final. */
    private static final Map<ApplicationStatus, Set<ApplicationStatus>> ALLOWED_TRANSITIONS = Map.of(
            ApplicationStatus.APPLIED, Set.of(ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED),
            ApplicationStatus.SHORTLISTED, Set.of(ApplicationStatus.HIRED, ApplicationStatus.REJECTED));

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final ResumeFileCleaner resumeFileCleaner;

    public ApplicationServiceImpl(ApplicationRepository applicationRepository,
                                  JobRepository jobRepository,
                                  UserRepository userRepository,
                                  CandidateProfileRepository profileRepository,
                                  FileStorageService fileStorageService,
                                  EmailService emailService,
                                  ResumeFileCleaner resumeFileCleaner) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.fileStorageService = fileStorageService;
        this.emailService = emailService;
        this.resumeFileCleaner = resumeFileCleaner;
    }

    @Override
    @Transactional
    public ApplicationResponse apply(Long candidateId, Long jobId, ApplicationRequest request, MultipartFile resume) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + jobId));
        if (!job.isActive()) {
            throw new BadRequestException("This job is no longer accepting applications");
        }
        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidateId)) {
            throw new DuplicateResourceException("You have already applied to this job");
        }

        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CandidateProfile profile = profileRepository.findByUserId(candidateId).orElse(null);

        String coverLetter = TextUtil.clean(request == null ? null : request.coverLetter());
        if (coverLetter != null && coverLetter.length() > Constants.MAX_COVER_LETTER_LENGTH) {
            throw new BadRequestException("Cover letter must be at most " + Constants.MAX_COVER_LETTER_LENGTH + " characters");
        }

        boolean uploaded = resume != null && !resume.isEmpty();
        String resumePath;
        if (uploaded) {
            resumePath = fileStorageService.store(resume, FileStorageService.Category.RESUME);
        } else if (profile != null && profile.getResumePath() != null) {
            resumePath = profile.getResumePath();
        } else {
            throw new BadRequestException("Please upload a resume, or add one to your profile first");
        }

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resumePath(resumePath)
                .coverLetter(coverLetter)
                .build();

        Application saved;
        try {
            saved = applicationRepository.saveAndFlush(application);
        } catch (DataIntegrityViolationException e) {
            // two clicks at the same moment: the unique (job, candidate) constraint caught it
            if (uploaded) {
                fileStorageService.delete(FileStorageService.Category.RESUME, resumePath);
            }
            throw new DuplicateResourceException("You have already applied to this job");
        }

        // copy everything the emails need now: lazy data is not available after the transaction ends
        String jobTitle = job.getTitle();
        String companyName = job.getCompany().getName();
        String recruiterName = job.getPostedBy().getName();
        String recruiterEmail = job.getPostedBy().getEmail();
        String candidateName = candidate.getName();
        String candidateEmail = candidate.getEmail();
        TransactionUtil.afterCommit(() -> {
            emailService.sendApplicationReceived(candidateEmail, candidateName, jobTitle, companyName);
            emailService.sendNewApplicantAlert(recruiterEmail, recruiterName, candidateName, jobTitle);
        });

        return ApplicationMapper.toResponse(saved, profile);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> myApplications(Long candidateId, int page, int size) {
        Page<Application> result = applicationRepository.findByCandidateId(candidateId, pageable(page, size));
        return PageResponse.from(result.map(a -> ApplicationMapper.toResponse(a, null)));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> forJob(Long recruiterId, Long jobId, ApplicationStatus status,
                                                    int page, int size) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + jobId));
        if (!job.getPostedBy().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You can view applicants only for jobs you posted");
        }

        Pageable pageable = pageable(page, size);
        Page<Application> result = status == null
                ? applicationRepository.findByJobId(jobId, pageable)
                : applicationRepository.findByJobIdAndStatus(jobId, status, pageable);

        Map<Long, CandidateProfile> profiles = loadProfiles(result.getContent());
        return PageResponse.from(result.map(a ->
                ApplicationMapper.toResponse(a, profiles.get(a.getCandidate().getId()))));
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getById(Long userId, Role role, Long applicationId) {
        Application a = findDetailed(applicationId);

        boolean owner = a.getCandidate().getId().equals(userId);
        boolean jobRecruiter = a.getJob().getPostedBy().getId().equals(userId);
        if (role != Role.ADMIN && !owner && !jobRecruiter) {
            throw new AccessDeniedException("You do not have access to this application");
        }

        CandidateProfile profile = profileRepository.findByUserId(a.getCandidate().getId()).orElse(null);
        return ApplicationMapper.toResponse(a, profile);
    }

    @Override
    @Transactional
    public ApplicationResponse updateStatus(Long recruiterId, Long applicationId, StatusUpdateRequest request) {
        Application a = findDetailed(applicationId);
        if (!a.getJob().getPostedBy().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You can update only applications for jobs you posted");
        }

        ApplicationStatus current = a.getStatus();
        ApplicationStatus next = request.status();
        if (!ALLOWED_TRANSITIONS.getOrDefault(current, Set.of()).contains(next)) {
            throw new BadRequestException("Cannot change status from " + current + " to " + next);
        }

        a.setStatus(next);
        applicationRepository.save(a);

        String candidateEmail = a.getCandidate().getEmail();
        String candidateName = a.getCandidate().getName();
        String jobTitle = a.getJob().getTitle();
        String companyName = a.getJob().getCompany().getName();
        TransactionUtil.afterCommit(() ->
                emailService.sendStatusUpdate(candidateEmail, candidateName, jobTitle, companyName, next));

        CandidateProfile profile = profileRepository.findByUserId(a.getCandidate().getId()).orElse(null);
        return ApplicationMapper.toResponse(a, profile);
    }

    @Override
    @Transactional
    public void withdraw(Long candidateId, Long applicationId) {
        Application a = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + applicationId));
        if (!a.getCandidate().getId().equals(candidateId)) {
            throw new AccessDeniedException("You can withdraw only your own applications");
        }
        if (a.getStatus() != ApplicationStatus.APPLIED) {
            throw new BadRequestException("Only applications in APPLIED status can be withdrawn");
        }

        String resumePath = a.getResumePath();
        applicationRepository.delete(a);
        applicationRepository.flush();
        TransactionUtil.afterCommit(() -> resumeFileCleaner.deleteIfUnreferenced(resumePath));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> candidateStats(Long candidateId) {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("total", applicationRepository.countByCandidateId(candidateId));
        for (ApplicationStatus s : ApplicationStatus.values()) {
            stats.put(s.name().toLowerCase(Locale.ROOT),
                    applicationRepository.countByCandidateIdAndStatus(candidateId, s));
        }
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> recruiterStats(Long recruiterId) {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("totalJobs", jobRepository.countByPostedById(recruiterId));
        stats.put("activeJobs", jobRepository.countByPostedByIdAndActive(recruiterId, true));
        stats.put("totalApplications", applicationRepository.countByRecruiter(recruiterId));
        for (ApplicationStatus s : ApplicationStatus.values()) {
            stats.put(s.name().toLowerCase(Locale.ROOT),
                    applicationRepository.countByRecruiterAndStatus(recruiterId, s));
        }
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canViewResume(Long userId, Role role, String filename) {
        if (role == Role.ADMIN) {
            return true;
        }
        if (role == Role.CANDIDATE) {
            return profileRepository.existsByResumePathAndUserId(filename, userId)
                    || applicationRepository.existsByResumePathAndCandidateId(filename, userId);
        }
        if (role == Role.RECRUITER) {
            return applicationRepository.countByResumePathAndRecruiter(filename, userId) > 0;
        }
        return false;
    }

    // ---------------- helpers ----------------

    private Application findDetailed(Long applicationId) {
        return applicationRepository.findDetailedById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + applicationId));
    }

    /** One query for all applicants' profiles instead of one per row. */
    private Map<Long, CandidateProfile> loadProfiles(Collection<Application> applications) {
        List<Long> candidateIds = applications.stream()
                .map(a -> a.getCandidate().getId())
                .distinct()
                .toList();
        if (candidateIds.isEmpty()) {
            return Map.of();
        }
        return profileRepository.findByUserIdIn(candidateIds).stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), Function.identity()));
    }

    private Pageable pageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), Constants.MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "appliedAt"));
    }
}