package com.jobportal.repository;

import com.jobportal.entity.Application;
import com.jobportal.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    @EntityGraph(attributePaths = {"job", "job.company", "candidate"})
    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company", "candidate"})
    Page<Application> findByJobId(Long jobId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company", "candidate"})
    Page<Application> findByJobIdAndStatus(Long jobId, ApplicationStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company", "job.postedBy", "candidate"})
    Optional<Application> findDetailedById(Long id);

    long countByJobId(Long jobId);

    long countByCandidateId(Long candidateId);

    long countByStatus(ApplicationStatus status);

    long countByCandidateIdAndStatus(Long candidateId, ApplicationStatus status);

    @Query("select count(a) from Application a where a.job.postedBy.id = :recruiterId")
    long countByRecruiter(@Param("recruiterId") Long recruiterId);

    @Query("select count(a) from Application a where a.job.postedBy.id = :recruiterId and a.status = :status")
    long countByRecruiterAndStatus(@Param("recruiterId") Long recruiterId,
                                   @Param("status") ApplicationStatus status);

    // ---- resume file access checks ----

    boolean existsByResumePath(String resumePath);

    boolean existsByResumePathAndCandidateId(String resumePath, Long candidateId);

    @Query("select count(a) from Application a where a.resumePath = :path and a.job.postedBy.id = :recruiterId")
    long countByResumePathAndRecruiter(@Param("path") String path, @Param("recruiterId") Long recruiterId);

    // ---- admin job delete ----

    @Query("select a.resumePath from Application a where a.job.id = :jobId and a.resumePath is not null")
    List<String> findResumePathsByJobId(@Param("jobId") Long jobId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from Application a where a.job.id = :jobId")
    void deleteByJobId(@Param("jobId") Long jobId);
}