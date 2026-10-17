package com.jobportal.config;

import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

/** Creates the first ADMIN user (admins cannot self-register). Runs only if app.admin.* is set. */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository,
                                       PasswordEncoder passwordEncoder,
                                       @Value("${app.admin.email:}") String adminEmail,
                                       @Value("${app.admin.password:}") String adminPassword,
                                       @Value("${app.admin.name:Admin}") String adminName) {
        return args -> {
            if (adminEmail.isBlank() || adminPassword.isBlank()) {
                log.info("app.admin.email / app.admin.password not set, skipping admin seed");
                return;
            }
            String email = adminEmail.trim().toLowerCase(Locale.ROOT);
            if (userRepository.existsByEmail(email)) {
                return;
            }
            User admin = User.builder()
                    .name(adminName)
                    .email(email)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created: {}", email);
        };
    }
}