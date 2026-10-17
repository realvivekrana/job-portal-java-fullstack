package com.jobportal.service.impl;

import com.jobportal.dto.request.CompanyRequest;
import com.jobportal.dto.response.CompanyResponse;
import com.jobportal.entity.Company;
import com.jobportal.entity.User;
import com.jobportal.exception.DuplicateResourceException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.mapper.CompanyMapper;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public CompanyResponse create(Long recruiterId, CompanyRequest request) {
        if (companyRepository.existsByRecruiterId(recruiterId)) {
            throw new DuplicateResourceException("You already have a company profile. Use PUT /api/companies/me to update it");
        }
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Company company = Company.builder()
                .name(request.name().trim())
                .description(clean(request.description()))
                .website(clean(request.website()))
                .location(clean(request.location()))
                .recruiter(recruiter)
                .build();

        return CompanyMapper.toResponse(companyRepository.save(company));
    }

    @Override
    @Transactional
    public CompanyResponse update(Long recruiterId, CompanyRequest request) {
        Company company = findMine(recruiterId);
        company.setName(request.name().trim());
        company.setDescription(clean(request.description()));
        company.setWebsite(clean(request.website()));
        company.setLocation(clean(request.location()));
        return CompanyMapper.toResponse(companyRepository.save(company));
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getMine(Long recruiterId) {
        return CompanyMapper.toResponse(findMine(recruiterId));
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + id));
        return CompanyMapper.toResponse(company);
    }

    private Company findMine(Long recruiterId) {
        return companyRepository.findByRecruiterId(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("You do not have a company profile yet. Create one first"));
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}