package com.example.urlshortener.dto;

import java.time.LocalDateTime;

public class UrlStatsResponse {

    private String shortCode;
    private String shortUrl;
    private String longUrl;
    private Long clickCount;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean expired;

    public UrlStatsResponse(String shortCode, String shortUrl, String longUrl, Long clickCount,
                            LocalDateTime createdAt, LocalDateTime expiresAt, boolean expired) {
        this.shortCode = shortCode;
        this.shortUrl = shortUrl;
        this.longUrl = longUrl;
        this.clickCount = clickCount;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.expired = expired;
    }

    public String getShortCode() { return shortCode; }
    public String getShortUrl() { return shortUrl; }
    public String getLongUrl() { return longUrl; }
    public Long getClickCount() { return clickCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isExpired() { return expired; }
}
