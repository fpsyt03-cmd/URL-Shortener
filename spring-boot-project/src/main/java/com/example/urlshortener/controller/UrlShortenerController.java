package com.example.urlshortener.controller;

import com.example.urlshortener.dto.ShortenRequest;
import com.example.urlshortener.dto.ShortenResponse;
import com.example.urlshortener.dto.UrlStatsResponse;
import com.example.urlshortener.service.UrlShortenerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class UrlShortenerController {

    private final UrlShortenerService urlShortenerService;

    public UrlShortenerController(UrlShortenerService urlShortenerService) {
        this.urlShortenerService = urlShortenerService;
    }

    /**
     * Feature 1: Shorten URL endpoint
     * POST /api/shorten
     */
    @PostMapping("/api/shorten")
    public ResponseEntity<ShortenResponse> shortenUrl(@Valid @RequestBody ShortenRequest request) {
        ShortenResponse response = urlShortenerService.shortenUrl(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Feature 2 & 3 & 4: HTTP 302 Redirection, Click Counter & Link Expiration
     * GET /{shortCode} (e.g., http://localhost:8080/aB3x9Z)
     */
    @GetMapping("/{shortCode:[a-zA-Z0-9_-]{3,12}}")
    public ResponseEntity<Void> redirectToLongUrl(@PathVariable String shortCode) {
        String longUrl = urlShortenerService.getLongUrlAndIncrementClick(shortCode);

        // Standard HTTP 302 Found redirect
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(longUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /**
     * Feature: Click Counter & Expiry Stats
     * GET /api/stats/{shortCode}
     */
    @GetMapping("/api/stats/{shortCode}")
    public ResponseEntity<UrlStatsResponse> getStats(@PathVariable String shortCode) {
        UrlStatsResponse stats = urlShortenerService.getStats(shortCode);
        return ResponseEntity.ok(stats);
    }

    /**
     * List all shortened links
     * GET /api/links
     */
    @GetMapping("/api/links")
    public ResponseEntity<List<UrlStatsResponse>> getAllLinks() {
        return ResponseEntity.ok(urlShortenerService.getAllLinks());
    }
}
