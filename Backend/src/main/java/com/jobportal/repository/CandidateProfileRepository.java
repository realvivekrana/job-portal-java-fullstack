package com.jobportal.repository;

import com.jobportal.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {

    Optional<CandidateProfile> findByUserId(Long userId);

    List<CandidateProfile> findByUserIdIn(Collection<Long> userIds);

    boolean existsByResumePath(String resumePath);

    boolean existsByResumePathAndUserId(String resumePath, Long userId);
}