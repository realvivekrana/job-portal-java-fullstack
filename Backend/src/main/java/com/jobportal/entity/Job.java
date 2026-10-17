package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs", indexes = {
        @Index(name = "idx_job_title", columnList = "title"),
        @Index(name = "idx_job_location", columnList = "location")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String location;

    private Double salaryMin;

    private Double salaryMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobType jobType;

    // comma separated: "Java,Spring Boot,MySQL"
    @Column(length = 500)
    private String skills;

    private Integer experienceRequired;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}