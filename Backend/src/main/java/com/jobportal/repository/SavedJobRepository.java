package com.jobportal.repository;

import com.jobportal.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {

    Optional<SavedJob> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    @Query("select s.job.id from SavedJob s where s.candidate.id = :candidateId")
    List<Long> findJobIdsByCandidateId(@Param("candidateId") Long candidateId);

    @Query(value = "select s from SavedJob s join fetch s.job j join fetch j.company join fetch j.postedBy "
            + "where s.candidate.id = :candidateId",
            countQuery = "select count(s) from SavedJob s where s.candidate.id = :candidateId")
    Page<SavedJob> findDetailedByCandidateId(@Param("candidateId") Long candidateId, Pageable pageable);
}