package com.jobportal.repository;

import com.jobportal.entity.Application;
import com.jobportal.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    // fetches job, company and candidate in one query (the response needs all three)
    @EntityGraph(attributePaths = {"job", "job.company", "candidate"})
    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);

    Page<Application> findByJobId(Long jobId, Pageable pageable);

    long countByJobId(Long jobId);

    long countByCandidateId(Long candidateId);

    long countByStatus(ApplicationStatus status);

    // resume access checks (FileController)
    boolean existsByResumePath(String resumePath);

    boolean existsByResumePathAndCandidateId(String resumePath, Long candidateId);

    boolean existsByResumePathAndJobPostedById(String resumePath, Long recruiterId);
}