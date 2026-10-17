package com.jobportal.service;

import com.jobportal.entity.ApplicationStatus;

/** All methods are fire-and-forget: they never throw, and do nothing if mail is not configured. */
public interface EmailService {

    /** Confirmation to the candidate. */
    void sendApplicationReceived(String toEmail, String candidateName, String jobTitle, String companyName);

    /** Alert to the recruiter who posted the job. */
    void sendNewApplicantAlert(String toEmail, String recruiterName, String candidateName, String jobTitle);

    void sendStatusUpdate(String toEmail, String candidateName, String jobTitle, String companyName,
                          ApplicationStatus status);
}