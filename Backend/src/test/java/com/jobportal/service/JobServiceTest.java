package com.jobportal.service;

import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.entity.Company;
import com.jobportal.entity.Job;
import com.jobportal.entity.JobType;
import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.exception.BadRequestException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.impl.JobServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobServiceImpl jobService;

    private User recruiter;
    private Company company;

    @BeforeEach
    void setUp() {
        recruiter = User.builder().id(1L).name("Rita Recruiter").email("rita@acme.com")
                .role(Role.RECRUITER).build();
        company = Company.builder().id(10L).name("Acme").recruiter(recruiter).build();
    }

    private JobRequest request(Double min, Double max) {
        return new JobRequest("  Java Developer ", "  Build APIs  ", " Pune ", min, max,
                JobType.FULL_TIME, "Java , Spring Boot,, MySQL ", 2);
    }

    private Job existingJob(User owner, boolean active) {
        return Job.builder().id(5L).title("Java Developer").description("d").location("Pune")
                .jobType(JobType.FULL_TIME).active(active).company(company).postedBy(owner).build();
    }

    @Test
    void create_withoutCompanyProfile_throwsBadRequest() {
        when(companyRepository.findByRecruiterId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.create(1L, request(1000.0, 2000.0)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("company profile");
        verify(jobRepository, never()).save(any());
    }

    @Test
    void create_withMinSalaryAboveMax_throwsBadRequest() {
        assertThatThrownBy(() -> jobService.create(1L, request(5000.0, 1000.0)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Minimum salary");
        verify(jobRepository, never()).save(any());
    }

    @Test
    void create_success_trimsFieldsAndNormalizesSkills() {
        when(companyRepository.findByRecruiterId(1L)).thenReturn(Optional.of(company));
        when(userRepository.findById(1L)).thenReturn(Optional.of(recruiter));
        when(jobRepository.save(any(Job.class))).thenAnswer(inv -> inv.getArgument(0));

        JobResponse response = jobService.create(1L, request(1000.0, 2000.0));

        assertThat(response.title()).isEqualTo("Java Developer");
        assertThat(response.location()).isEqualTo("Pune");
        assertThat(response.skills()).isEqualTo("Java,Spring Boot,MySQL");
        assertThat(response.companyName()).isEqualTo("Acme");
        assertThat(response.active()).isTrue();
    }

    @Test
    void update_byAnotherRecruiter_throwsAccessDenied() {
        User other = User.builder().id(2L).role(Role.RECRUITER).build();
        when(jobRepository.findById(5L)).thenReturn(Optional.of(existingJob(other, true)));

        assertThatThrownBy(() -> jobService.update(1L, 5L, request(null, null)))
                .isInstanceOf(AccessDeniedException.class);
        verify(jobRepository, never()).save(any());
    }

    @Test
    void setActive_byOwner_closesJob() {
        Job job = existingJob(recruiter, true);
        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(jobRepository.save(any(Job.class))).thenAnswer(inv -> inv.getArgument(0));

        JobResponse response = jobService.setActive(1L, 5L, false);

        assertThat(response.active()).isFalse();
    }

    @Test
    void getById_closedJob_isHiddenFromPublic() {
        when(jobRepository.findById(5L)).thenReturn(Optional.of(existingJob(recruiter, false)));

        assertThatThrownBy(() -> jobService.getById(5L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void search_withUnknownSortField_throwsBadRequest() {
        assertThatThrownBy(() -> jobService.search(null, 0, 10, "password", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("sortBy");
    }
}