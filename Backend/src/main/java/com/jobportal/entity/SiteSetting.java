package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;

/** One admin-editable piece of website content (hero text, footer text, ...). Missing rows fall back to defaults. */
@Entity
@Table(name = "site_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SiteSetting {

    @Id
    @Column(name = "setting_key", length = 60)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;
}