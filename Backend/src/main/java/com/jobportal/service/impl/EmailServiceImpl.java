package com.jobportal.service.impl;

import com.jobportal.entity.ApplicationStatus;
import com.jobportal.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final TemplateEngine templateEngine;
    private final String from;

    public EmailServiceImpl(ObjectProvider<JavaMailSender> mailSenderProvider,
                            TemplateEngine templateEngine,
                            @Value("${app.mail.from:}") String from) {
        this.mailSenderProvider = mailSenderProvider;
        this.templateEngine = templateEngine;
        this.from = from;
    }

    @Override
    @Async
    public void sendApplicationReceived(String toEmail, String candidateName, String jobTitle, String companyName) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("heading", "Application received");
        vars.put("recipientName", candidateName);
        vars.put("message", "Your application has been submitted. The recruiter will review it and you will "
                + "get an email when the status changes.");
        vars.put("jobTitle", jobTitle);
        vars.put("companyName", companyName);
        send(toEmail, "Application received: " + jobTitle, "application-received", vars);
    }

    @Override
    @Async
    public void sendNewApplicantAlert(String toEmail, String recruiterName, String candidateName, String jobTitle) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("heading", "New applicant");
        vars.put("recipientName", recruiterName);
        vars.put("message", candidateName + " has applied for this job. Open the Job Portal to review the "
                + "application and update its status.");
        vars.put("jobTitle", jobTitle);
        vars.put("companyName", null);
        send(toEmail, "New applicant for " + jobTitle, "application-received", vars);
    }

    @Override
    @Async
    public void sendStatusUpdate(String toEmail, String candidateName, String jobTitle, String companyName,
                                 ApplicationStatus status) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("candidateName", candidateName);
        vars.put("jobTitle", jobTitle);
        vars.put("companyName", companyName);
        vars.put("statusLabel", label(status));
        vars.put("message", messageFor(status));
        vars.put("accentColor", colorFor(status));
        send(toEmail, "Application update: " + jobTitle, "status-update", vars);
    }

    private void send(String to, String subject, String template, Map<String, Object> vars) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || from == null || from.isBlank()) {
            log.info("Mail is not configured, skipping email '{}' to {}", subject, to);
            return;
        }
        try {
            String html = templateEngine.process(template, new Context(Locale.ENGLISH, vars));
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            sender.send(message);
        } catch (Exception e) {
            log.warn("Could not send email '{}' to {}: {}", subject, to, e.getMessage());
        }
    }

    private String label(ApplicationStatus status) {
        String name = status.name();
        return name.charAt(0) + name.substring(1).toLowerCase(Locale.ROOT);
    }

    private String messageFor(ApplicationStatus status) {
        return switch (status) {
            case SHORTLISTED -> "Good news! You have been shortlisted. The recruiter may contact you soon.";
            case HIRED -> "Congratulations! You have been selected for this role.";
            case REJECTED -> "Thank you for applying. The recruiter has decided not to move forward with "
                    + "your application this time. We wish you all the best.";
            case APPLIED -> "Your application is under review.";
        };
    }

    private String colorFor(ApplicationStatus status) {
        return switch (status) {
            case SHORTLISTED -> "#2563eb";
            case HIRED -> "#16a34a";
            case REJECTED -> "#dc2626";
            case APPLIED -> "#6b7280";
        };
    }
}