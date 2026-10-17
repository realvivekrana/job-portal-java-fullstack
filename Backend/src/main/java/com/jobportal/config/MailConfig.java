package com.jobportal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Turns on @Async so emails are sent in the background and never slow down
 * (or break) the API request that triggered them.
 */
@Configuration
@EnableAsync
public class MailConfig {
}