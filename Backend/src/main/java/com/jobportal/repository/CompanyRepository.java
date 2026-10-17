package com.jobportal.repository;

import com.jobportal.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByRecruiterId(Long recruiterId);

    boolean existsByRecruiterId(Long recruiterId);
}