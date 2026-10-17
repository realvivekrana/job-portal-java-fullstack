package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String website;

    private String location;

    private String logo;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false, unique = true)
    private User recruiter;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}