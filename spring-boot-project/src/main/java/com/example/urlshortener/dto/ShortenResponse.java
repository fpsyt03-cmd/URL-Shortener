package com.example.urlshortener.dto;

import java.time.LocalDateTime;

public class ShortenResponse {

    private String shortCode;
    private String shortUrl;
    private String longUrl;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Long clickCount;

    public ShortenResponse(String shortCode, String shortUrl, String longUrl,
                           LocalDateTime createdAt, LocalDateTime expiresAt, Long clickCount) {
        this.shortCode = shortCode;
        this.shortUrl = shortUrl;
        this.longUrl = longUrl;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.clickCount = clickCount;
    }

    public String getShortCode() { return shortCode; }
    public String getShortUrl() { return shortUrl; }
    public String getLongUrl() { return longUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public Long getClickCount() { return clickCount; }
}
