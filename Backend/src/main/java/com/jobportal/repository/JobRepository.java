package com.jobportal.repository;

import com.jobportal.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    Page<Job> findByPostedById(Long userId, Pageable pageable);

    Page<Job> findByActiveTrue(Pageable pageable);

    long countByPostedById(Long userId);
}