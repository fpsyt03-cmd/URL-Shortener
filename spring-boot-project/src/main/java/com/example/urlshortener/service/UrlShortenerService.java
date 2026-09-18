package com.example.urlshortener.service;

import com.example.urlshortener.dto.ShortenRequest;
import com.example.urlshortener.dto.ShortenResponse;
import com.example.urlshortener.dto.UrlStatsResponse;
import com.example.urlshortener.exception.LinkExpiredException;
import com.example.urlshortener.exception.LinkNotFoundException;
import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.repository.UrlMappingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UrlShortenerService {

    private static final String BASE62_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 6;
    private final SecureRandom random = new SecureRandom();

    private final UrlMappingRepository repository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public UrlShortenerService(UrlMappingRepository repository) {
        this.repository = repository;
    }

    /**
     * Shortens a long URL by generating a unique 6-character code
     */
    @Transactional
    public ShortenResponse shortenUrl(ShortenRequest request) {
        String longUrl = request.getLongUrl().trim();
        
        // Handle custom code or generate 6-character short code
        String shortCode;
        if (request.getCustomCode() != null && !request.getCustomCode().isBlank()) {
            shortCode = request.getCustomCode().trim();
            if (repository.existsByShortCode(shortCode)) {
                throw new IllegalArgumentException("Custom short code '" + shortCode + "' is already in use.");
            }
        } else {
            shortCode = generateUniqueShortCode();
        }

        // Calculate expiresAt date
        LocalDateTime expiresAt = null;
        if (request.getExpiresInHours() != null && request.getExpiresInHours() > 0) {
            expiresAt = LocalDateTime.now().plusHours(request.getExpiresInHours());
        } else if (request.getExpiresAt() != null) {
            expiresAt = request.getExpiresAt();
        }

        UrlMapping mapping = new UrlMapping(shortCode, longUrl, expiresAt);
        repository.save(mapping);

        String shortUrl = baseUrl + "/" + shortCode;
        return new ShortenResponse(
            shortCode,
            shortUrl,
            longUrl,
            mapping.getCreatedAt(),
            mapping.getExpiresAt(),
            mapping.getClickCount()
        );
    }

    /**
     * Retrieves the long URL for HTTP 302 redirection, checks expiration, and increments click_count
     */
    @Transactional
    public String getLongUrlAndIncrementClick(String shortCode) {
        UrlMapping mapping = repository.findByShortCode(shortCode)
                .orElseThrow(() -> new LinkNotFoundException("Short URL code '" + shortCode + "' was not found."));

        // Feature: Link Expiration check
        if (mapping.isExpired()) {
            throw new LinkExpiredException("This link expired on " + mapping.getExpiresAt());
        }

        // Feature: Increment click counter
        mapping.incrementClickCount();
        repository.save(mapping);

        return mapping.getLongUrl();
    }

    /**
     * Gets statistics and click count for a short code
     */
    @Transactional(readOnly = true)
    public UrlStatsResponse getStats(String shortCode) {
        UrlMapping mapping = repository.findByShortCode(shortCode)
                .orElseThrow(() -> new LinkNotFoundException("Short URL code '" + shortCode + "' was not found."));

        return new UrlStatsResponse(
            mapping.getShortCode(),
            baseUrl + "/" + mapping.getShortCode(),
            mapping.getLongUrl(),
            mapping.getClickCount(),
            mapping.getCreatedAt(),
            mapping.getExpiresAt(),
            mapping.isExpired()
        );
    }

    /**
     * Lists all shortened links
     */
    @Transactional(readOnly = true)
    public List<UrlStatsResponse> getAllLinks() {
        return repository.findAll().stream()
            .map(mapping -> new UrlStatsResponse(
                mapping.getShortCode(),
                baseUrl + "/" + mapping.getShortCode(),
                mapping.getLongUrl(),
                mapping.getClickCount(),
                mapping.getCreatedAt(),
                mapping.getExpiresAt(),
                mapping.isExpired()
            ))
            .collect(Collectors.toList());
    }

    /**
     * Generates a 6-character Base62 string with collision retry
     */
    private String generateUniqueShortCode() {
        int maxAttempts = 10;
        for (int i = 0; i < maxAttempts; i++) {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int j = 0; j < CODE_LENGTH; j++) {
                int index = random.nextInt(BASE62_CHARS.length());
                sb.append(BASE62_CHARS.charAt(index));
            }
            String code = sb.toString();
            if (!repository.existsByShortCode(code)) {
                return code;
            }
        }
        // Fallback: 7 characters if high collision
        return Long.toHexString(System.currentTimeMillis()).substring(6);
    }
}
