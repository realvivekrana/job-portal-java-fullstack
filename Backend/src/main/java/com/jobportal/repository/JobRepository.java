package com.jobportal.repository;

import com.jobportal.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    Page<Job> findByPostedById(Long userId, Pageable pageable);

    Page<Job> findByActiveTrue(Pageable pageable);

    long countByPostedById(Long userId);

    long countByPostedByIdAndActive(Long userId, boolean active);

    long countByActive(boolean active);

    // ---- public overview (home page) ----

    @Query("select count(distinct j.company.id) from Job j where j.active = true")
    long countActiveCompanies();

    @Query("select j.jobType, count(j) from Job j where j.active = true group by j.jobType")
    List<Object[]> countActiveByJobType();

    @Query("select j.skills from Job j where j.active = true and j.skills is not null")
    List<String> findActiveSkills();

    @Query("select j.location from Job j where j.active = true")
    List<String> findActiveLocations();

    /** Rows: id, name, logo, location, open job count. */
    @Query("select c.id, c.name, c.logo, c.location, count(j) from Job j join j.company c "
            + "where j.active = true group by c.id, c.name, c.logo, c.location "
            + "order by count(j) desc, c.name asc")
    List<Object[]> topHiringCompanies(Pageable pageable);
}