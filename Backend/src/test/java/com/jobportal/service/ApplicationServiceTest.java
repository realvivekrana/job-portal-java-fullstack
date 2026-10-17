package com.jobportal.service;

import com.jobportal.dto.request.ApplicationRequest;
import com.jobportal.dto.request.StatusUpdateRequest;
import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.entity.Application;
import com.jobportal.entity.ApplicationStatus;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.Company;
import com.jobportal.entity.Job;
import com.jobportal.entity.JobType;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.DuplicateResourceException;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.CandidateProfileRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.impl.ApplicationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CandidateProfileRepository profileRepository;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private EmailService emailService;
    @Mock
    private ResumeFileCleaner resumeFileCleaner;

    @InjectMocks
    private ApplicationServiceImpl service;

    private User recruiter;
    private User candidate;
    private Company company;
    private Job job;

    @BeforeEach
    void setUp() {
        recruiter = User.builder().id(2L).name("Rita").email("rita@acme.com").role(Role.RECRUITER).build();
        candidate = User.builder().id(1L).name("Cathy").email("cathy@mail.com").role(Role.CANDIDATE).build();
        company = Company.builder().id(10L).name("Acme").recruiter(recruiter).build();
        job = Job.builder().id(5L).title("Java Developer").description("d").location("Pune")
                .jobType(JobType.FULL_TIME).active(true).company(company).postedBy(recruiter).build();
    }

    private Application application(ApplicationStatus status) {
        return Application.builder().id(7L).job(job).candidate(candidate)
                .resumePath("cv.pdf").status(status).build();
    }

    // ---------------- apply ----------------

    @Test
    void apply_withProfileResume_savesApplicationAndSendsEmails() {
        CandidateProfile profile = CandidateProfile.builder().id(3L).user(candidate).resumePath("profile.pdf").build();
        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByJobIdAndCandidateId(5L, 1L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(candidate));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(applicationRepository.saveAndFlush(any(Application.class))).thenAnswer(inv -> {
            Application a = inv.getArgument(0);
            a.setId(7L);
            return a;
        });

        ApplicationResponse response = service.apply(1L, 5L, new ApplicationRequest("  I am keen  "), null);

        assertThat(response.status()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(response.coverLetter()).isEqualTo("I am keen");
        assertThat(response.resumeUrl()).isEqualTo("/api/files/resumes/profile.pdf");
        assertThat(response.jobTitle()).isEqualTo("Java Developer");
        verify(emailService).sendApplicationReceived("cathy@mail.com", "Cathy", "Java Developer", "Acme");
        verify(emailService).sendNewApplicantAlert("rita@acme.com", "Rita", "Cathy", "Java Developer");
    }

    @Test
    void apply_withUploadedResume_storesTheFile() {
        MockMultipartFile file = new MockMultipartFile("resume", "cv.pdf", "application/pdf", "%PDF-1.4".getBytes());
        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByJobIdAndCandidateId(5L, 1L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(candidate));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(fileStorageService.store(file, FileStorageService.Category.RESUME)).thenReturn("new.pdf");
        when(applicationRepository.saveAndFlush(any(Application.class))).thenAnswer(inv -> inv.getArgument(0));

        ApplicationResponse response = service.apply(1L, 5L, new ApplicationRequest(null), file);

        assertThat(response.resumeUrl()).isEqualTo("/api/files/resumes/new.pdf");
    }

    @Test
    void apply_twiceToSameJob_throwsDuplicate() {
        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByJobIdAndCandidateId(5L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.apply(1L, 5L, new ApplicationRequest(null), null))
                .isInstanceOf(DuplicateResourceException.class);
        verify(applicationRepository, never()).saveAndFlush(any());
    }

    @Test
    void apply_toClosedJob_throwsBadRequest() {
        job.setActive(false);
        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));

        assertThatThrownBy(() -> service.apply(1L, 5L, new ApplicationRequest(null), null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("no longer accepting");
    }

    @Test
    void apply_withoutAnyResume_throwsBadRequest() {
        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByJobIdAndCandidateId(5L, 1L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(candidate));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.apply(1L, 5L, new ApplicationRequest(null), null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("resume");
        verify(applicationRepository, never()).saveAndFlush(any());
    }

    // ---------------- status updates ----------------

    @Test
    void updateStatus_appliedToShortlisted_notifiesCandidate() {
        when(applicationRepository.findDetailedById(7L)).thenReturn(Optional.of(application(ApplicationStatus.APPLIED)));

        ApplicationResponse response = service.updateStatus(2L, 7L, new StatusUpdateRequest(ApplicationStatus.SHORTLISTED));

        assertThat(response.status()).isEqualTo(ApplicationStatus.SHORTLISTED);
        verify(emailService).sendStatusUpdate(eq("cathy@mail.com"), eq("Cathy"), eq("Java Developer"),
                eq("Acme"), eq(ApplicationStatus.SHORTLISTED));
    }

    @Test
    void updateStatus_fromFinalStatus_throwsBadRequest() {
        when(applicationRepository.findDetailedById(7L)).thenReturn(Optional.of(application(ApplicationStatus.REJECTED)));

        assertThatThrownBy(() -> service.updateStatus(2L, 7L, new StatusUpdateRequest(ApplicationStatus.HIRED)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot change status");
        verify(emailService, never()).sendStatusUpdate(any(), any(), any(), any(), any());
    }

    @Test
    void updateStatus_byRecruiterOfAnotherJob_throwsAccessDenied() {
        when(applicationRepository.findDetailedById(7L)).thenReturn(Optional.of(application(ApplicationStatus.APPLIED)));

        assertThatThrownBy(() -> service.updateStatus(99L, 7L, new StatusUpdateRequest(ApplicationStatus.SHORTLISTED)))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ---------------- withdraw ----------------

    @Test
    void withdraw_whenAlreadyShortlisted_throwsBadRequest() {
        when(applicationRepository.findById(7L)).thenReturn(Optional.of(application(ApplicationStatus.SHORTLISTED)));

        assertThatThrownBy(() -> service.withdraw(1L, 7L))
                .isInstanceOf(BadRequestException.class);
        verify(applicationRepository, never()).delete(any());
    }

    @Test
    void withdraw_byAnotherCandidate_throwsAccessDenied() {
        when(applicationRepository.findById(7L)).thenReturn(Optional.of(application(ApplicationStatus.APPLIED)));

        assertThatThrownBy(() -> service.withdraw(99L, 7L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void withdraw_appliedApplication_deletesItAndCleansResume() {
        Application a = application(ApplicationStatus.APPLIED);
        when(applicationRepository.findById(7L)).thenReturn(Optional.of(a));

        service.withdraw(1L, 7L);

        verify(applicationRepository).delete(a);
        verify(resumeFileCleaner).deleteIfUnreferenced("cv.pdf");
    }

    // ---------------- resume access ----------------

    @Test
    void canViewResume_followsRoleRules() {
        when(applicationRepository.countByResumePathAndRecruiter("cv.pdf", 2L)).thenReturn(1L);
        when(applicationRepository.countByResumePathAndRecruiter("cv.pdf", 3L)).thenReturn(0L);
        when(profileRepository.existsByResumePathAndUserId("cv.pdf", 1L)).thenReturn(true);

        assertThat(service.canViewResume(100L, Role.ADMIN, "cv.pdf")).isTrue();
        assertThat(service.canViewResume(2L, Role.RECRUITER, "cv.pdf")).isTrue();
        assertThat(service.canViewResume(3L, Role.RECRUITER, "cv.pdf")).isFalse();
        assertThat(service.canViewResume(1L, Role.CANDIDATE, "cv.pdf")).isTrue();
    }
}