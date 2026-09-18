package com.example.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;
import java.time.LocalDateTime;

public class ShortenRequest {

    @NotBlank(message = "Long URL must not be blank")
    @URL(message = "Please provide a valid URL format (e.g. https://example.com)")
    private String longUrl;

    private String customCode;

    private Long expiresInHours;

    private LocalDateTime expiresAt;

    public ShortenRequest() {}

    public ShortenRequest(String longUrl, Long expiresInHours) {
        this.longUrl = longUrl;
        this.expiresInHours = expiresInHours;
    }

    public String getLongUrl() { return longUrl; }
    public void setLongUrl(String longUrl) { this.longUrl = longUrl; }

    public String getCustomCode() { return customCode; }
    public void setCustomCode(String customCode) { this.customCode = customCode; }

    public Long getExpiresInHours() { return expiresInHours; }
    public void setExpiresInHours(Long expiresInHours) { this.expiresInHours = expiresInHours; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
