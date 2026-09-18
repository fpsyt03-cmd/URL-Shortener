import { JavaProjectFile } from '../types';

export const JAVA_PROJECT_FILES: JavaProjectFile[] = [
  {
    path: 'pom.xml',
    name: 'pom.xml',
    category: 'config',
    description: 'Maven build file with Spring Boot 3.3, Web, Data JPA, H2, MySQL Driver & Validation',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>com.example</groupId>
    <artifactId>url-shortener</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>url-shortener</name>
    <description>TinyURL / Bitly Clone in Spring Boot with 6-char Base62 codes, 302 redirects, click tracking and expiration</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web: REST APIs, DispatcherServlet, Tomcat -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Data JPA: Hibernate ORM for database persistence -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Bean Validation: Validating URLs and incoming payloads -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- H2 In-Memory / File Database (Enabled by default for zero-setup local dev) -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- MySQL Connector (Optional: uncomment MySQL properties in application.properties) -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Testing: JUnit 5, Mockito, MockMvc -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    path: 'src/main/resources/application.properties',
    name: 'application.properties',
    category: 'config',
    description: 'Spring Boot configuration with embedded H2 DB & console, plus ready MySQL configuration',
    content: `# Application Server Port
server.port=8080

# Base URL for generated short links
app.base-url=http://localhost:8080

# -------------------------------------------------------------
# DATABASE CONFIGURATION: H2 (Default - No installation needed)
# -------------------------------------------------------------
spring.datasource.url=jdbc:h2:mem:urlshortener;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# Enable H2 Web Console at http://localhost:8080/h2-console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=false

# Hibernate DDL auto creation
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# -------------------------------------------------------------
# OPTIONAL: MYSQL CONFIGURATION (Uncomment below to switch to MySQL)
# -------------------------------------------------------------
# spring.datasource.url=jdbc:mysql://localhost:3306/url_shortener?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
# spring.datasource.username=root
# spring.datasource.password=your_password
# spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
# spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
# spring.jpa.hibernate.ddl-auto=update
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/UrlShortenerApplication.java',
    name: 'UrlShortenerApplication.java',
    category: 'core',
    description: 'Spring Boot main entry point class with @SpringBootApplication',
    content: `package com.example.urlshortener;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UrlShortenerApplication {

    public static void main(String[] args) {
        SpringApplication.run(UrlShortenerApplication.class, args);
        System.out.println("=================================================");
        System.out.println("  URL Shortener is running on http://localhost:8080");
        System.out.println("  H2 Console: http://localhost:8080/h2-console");
        System.out.println("=================================================");
    }
}
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/model/UrlMapping.java',
    name: 'UrlMapping.java',
    category: 'model',
    description: 'JPA Entity representing the shortened URL, original long URL, click counter, and expiresAt date',
    content: `package com.example.urlshortener.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "url_mappings", indexes = {
    @Index(name = "idx_short_code", columnList = "short_code", unique = true)
})
public class UrlMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "short_code", nullable = false, length = 10, unique = true)
    private String shortCode;

    @Column(name = "long_url", nullable = false, length = 2048)
    private String longUrl;

    @Column(name = "click_count", nullable = false)
    private Long clickCount = 0L;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    public UrlMapping() {
        this.createdAt = LocalDateTime.now();
        this.clickCount = 0L;
    }

    public UrlMapping(String shortCode, String longUrl, LocalDateTime expiresAt) {
        this.shortCode = shortCode;
        this.longUrl = longUrl;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
        this.clickCount = 0L;
    }

    // Helper: checks whether this link has expired
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    // Helper: increments the click counter
    public void incrementClickCount() {
        if (this.clickCount == null) {
            this.clickCount = 1L;
        } else {
            this.clickCount++;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getShortCode() { return shortCode; }
    public void setShortCode(String shortCode) { this.shortCode = shortCode; }

    public String getLongUrl() { return longUrl; }
    public void setLongUrl(String longUrl) { this.longUrl = longUrl; }

    public Long getClickCount() { return clickCount; }
    public void setClickCount(Long clickCount) { this.clickCount = clickCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/repository/UrlMappingRepository.java',
    name: 'UrlMappingRepository.java',
    category: 'model',
    description: 'Spring Data JPA Repository providing findByShortCode and existsByShortCode queries',
    content: `package com.example.urlshortener.repository;

import com.example.urlshortener.model.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UrlMappingRepository extends JpaRepository<UrlMapping, Long> {

    Optional<UrlMapping> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);
}
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/service/UrlShortenerService.java',
    name: 'UrlShortenerService.java',
    category: 'service',
    description: 'Core business logic: Base62 6-character code generation, collision check, 302 resolution, click increment, and expiration check',
    content: `package com.example.urlshortener.service;

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

    @Value("\${app.base-url:http://localhost:8080}")
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
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/controller/UrlShortenerController.java',
    name: 'UrlShortenerController.java',
    category: 'controller',
    description: 'REST Controller implementing HTTP 302 redirect, POST /api/shorten, and GET /api/stats',
    content: `package com.example.urlshortener.controller;

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
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/dto/ShortenRequest.java',
    name: 'ShortenRequest.java',
    category: 'model',
    description: 'Data Transfer Object for URL shorten request with URL validation',
    content: `package com.example.urlshortener.dto;

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
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/dto/ShortenResponse.java',
    name: 'ShortenResponse.java',
    category: 'model',
    description: 'Response payload returned after creating short URL',
    content: `package com.example.urlshortener.dto;

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
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/dto/UrlStatsResponse.java',
    name: 'UrlStatsResponse.java',
    category: 'model',
    description: 'Response payload showing click counts and expiration status',
    content: `package com.example.urlshortener.dto;

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
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/exception/LinkExpiredException.java',
    name: 'LinkExpiredException.java',
    category: 'core',
    description: 'Custom runtime exception thrown when a link has passed its expiresAt date',
    content: `package com.example.urlshortener.exception;

public class LinkExpiredException extends RuntimeException {
    public LinkExpiredException(String message) {
        super(message);
    }
}
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/exception/LinkNotFoundException.java',
    name: 'LinkNotFoundException.java',
    category: 'core',
    description: 'Custom runtime exception thrown when a short code does not exist in the database',
    content: `package com.example.urlshortener.exception;

public class LinkNotFoundException extends RuntimeException {
    public LinkNotFoundException(String message) {
        super(message);
    }
}
`
  },
  {
    path: 'src/main/java/com/example/urlshortener/exception/GlobalExceptionHandler.java',
    name: 'GlobalExceptionHandler.java',
    category: 'core',
    description: 'ControllerAdvice handling 410 Gone for expired links, 404 for not found, and 400 for validation errors',
    content: `package com.example.urlshortener.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles expired link clicks with HTTP 410 GONE
     */
    @ExceptionHandler(LinkExpiredException.class)
    public ResponseEntity<Map<String, Object>> handleLinkExpired(LinkExpiredException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.GONE.value());
        body.put("error", "Link Expired");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.GONE);
    }

    /**
     * Handles nonexistent short codes with HTTP 404 NOT FOUND
     */
    @ExceptionHandler(LinkNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleLinkNotFound(LinkNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles validation errors (e.g. invalid URL) with HTTP 400 BAD REQUEST
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("details", errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Invalid Request");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
`
  },
  {
    path: 'src/test/java/com/example/urlshortener/UrlShortenerApplicationTests.java',
    name: 'UrlShortenerApplicationTests.java',
    category: 'test',
    description: 'Complete JUnit 5 & MockMvc integration tests verifying shortening, 302 redirect, click count increment, and expired link rejection',
    content: `package com.example.urlshortener;

import com.example.urlshortener.dto.ShortenRequest;
import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.repository.UrlMappingRepository;
import com.example.urlshortener.service.UrlShortenerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UrlShortenerApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UrlMappingRepository repository;

    @Autowired
    private UrlShortenerService service;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void contextLoads() {
        assertNotNull(service);
    }

    @Test
    void testShortenUrl_GeneratesSixCharacterCode() throws Exception {
        String json = "{\\"longUrl\\": \\"https://example.com/very/long/article?id=123\\", \\"expiresInHours\\": 24}";

        mockMvc.perform(post("/api/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.shortCode", hasLength(6)))
                .andExpect(jsonPath("$.longUrl", is("https://example.com/very/long/article?id=123")))
                .andExpect(jsonPath("$.clickCount", is(0)));
    }

    @Test
    void testRedirect_ReturnsHttp302_AndIncrementsClickCounter() throws Exception {
        UrlMapping mapping = new UrlMapping("aB3x9Z", "https://example.com", null);
        repository.save(mapping);

        // Perform HTTP GET on the short code
        mockMvc.perform(get("/aB3x9Z"))
                .andExpect(status().isFound()) // HTTP 302
                .andExpect(header().string("Location", "https://example.com"));

        // Verify click count was incremented in database
        UrlMapping updated = repository.findByShortCode("aB3x9Z").orElseThrow();
        assertEquals(1L, updated.getClickCount(), "Click count should be incremented to 1");
    }

    @Test
    void testExpiredLink_ReturnsHttp410Gone() throws Exception {
        // Link expired 1 hour ago
        LocalDateTime pastDate = LocalDateTime.now().minusHours(1);
        UrlMapping expiredMapping = new UrlMapping("oldLnk", "https://example.com/expired", pastDate);
        repository.save(expiredMapping);

        // Visiting expired link should fail with 410 GONE
        mockMvc.perform(get("/oldLnk"))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.error", is("Link Expired")));
    }
}
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'doc',
    description: 'Comprehensive setup guide for VS Code, required extensions, terminal commands, curl tests & MySQL setup',
    content: `# Spring Boot URL Shortener (TinyURL / Bitly Clone)

A beginner-friendly yet interview-grade URL Shortener built with **Java 17**, **Spring Boot 3.3**, and **H2 / MySQL**.

## Features Implemented
1. **Shorten URL**: Accepts long URL and generates a 6-character Base62 code (e.g., \`http://localhost:8080/aB3x9Z\`).
2. **HTTP 302 Redirection**: Looks up the short code in the database and returns a real \`HTTP 302 Found\` redirect header.
3. **Click Counter**: Increments the \`click_count\` column in the database on every visit.
4. **Link Expiration**: Verifies \`expires_at\`. Expired links return \`410 GONE\` with an informative error message.
5. **H2 In-Memory DB & Console**: Ready out of the box with zero external setup needed.
6. **MySQL Ready**: Switch from H2 to MySQL with 1 configuration line.

---

## 🛠️ Required VS Code Extensions to Download

Open VS Code, press \`Ctrl+Shift+X\` (or \`Cmd+Shift+X\` on Mac) to open the Extensions view, and install:

1. **Extension Pack for Java** (Publisher: *Microsoft*, ID: \`vscjava.vscode-java-pack\`)
   - Includes Language Support for Java by Red Hat, Debugger for Java, Maven for Java, Project Manager, and Test Runner.
2. **Spring Boot Extension Pack** (Publisher: *VMware*, ID: \`vmware.vscode-spring-boot-pack\`)
   - Includes Spring Boot Tools (navigation, property completions), Spring Initializr, and Spring Boot Dashboard.
3. *(Recommended)* **Thunder Client** (Publisher: *Ranga Vadhineni*)
   - Lightweight REST API client inside VS Code for testing endpoints without leaving the editor.
4. *(Optional)* **Database Client** (Publisher: *cweijan*)
   - Connect and query your H2 or MySQL database directly from VS Code.

---

## 🚀 How to Run Locally in VS Code Terminal

### Prerequisites
- Java JDK 17 or higher (\`java -version\`)
- Maven (or use the included Maven wrapper)

### Step 1: Open Folder in VS Code
Open the project folder in VS Code:
\`\`\`bash
code .
\`\`\`

### Step 2: Run via Terminal
Open the integrated terminal (\`Ctrl+\` \` or \`Terminal -> New Terminal\`):

**Linux / macOS:**
\`\`\`bash
./mvnw spring-boot:run
\`\`\`
*(Or if you have Maven installed:* \`mvn spring-boot:run\`*)*

**Windows PowerShell / CMD:**
\`\`\`cmd
.\\mvnw.cmd spring-boot:run
\`\`\`

You will see:
\`\`\`
URL Shortener is running on http://localhost:8080
H2 Console: http://localhost:8080/h2-console
\`\`\`

---

## 🧪 Testing the Endpoints via Terminal (curl)

### 1. Shorten a URL
\`\`\`bash
curl -X POST http://localhost:8080/api/shorten \\
  -H "Content-Type: application/json" \\
  -d '{
    "longUrl": "https://github.com/spring-projects/spring-boot",
    "expiresInHours": 24
  }'
\`\`\`
**Response (201 Created):**
\`\`\`json
{
  "shortCode": "aB3x9Z",
  "shortUrl": "http://localhost:8080/aB3x9Z",
  "longUrl": "https://github.com/spring-projects/spring-boot",
  "createdAt": "2026-09-16T15:30:00",
  "expiresAt": "2026-09-17T15:30:00",
  "clickCount": 0
}
\`\`\`

### 2. Test the HTTP 302 Redirection
Open your browser and visit:
\`\`\`
http://localhost:8080/aB3x9Z
\`\`\`
Or test via curl with verbose redirect headers:
\`\`\`bash
curl -i http://localhost:8080/aB3x9Z
\`\`\`
Notice the \`HTTP/1.1 302 Found\` status and \`Location: https://github.com/...\` header!

### 3. Check Click Count & Analytics
\`\`\`bash
curl http://localhost:8080/api/stats/aB3x9Z
\`\`\`
Notice \`"clickCount": 1\` (or more, every time you visited the link)!

### 4. Test Expired Link Behavior
Create a link with a past expiration date or wait for it to expire:
\`\`\`bash
curl -i http://localhost:8080/oldExpiredCode
\`\`\`
**Response (410 Gone):**
\`\`\`json
{
  "error": "Link Expired",
  "message": "This link expired on 2026-09-16T14:00:00",
  "status": 410
}
\`\`\`

---

## 🗄️ Viewing Data in H2 Console
1. Open \`http://localhost:8080/h2-console\` in your browser
2. Set **JDBC URL** to: \`jdbc:h2:mem:urlshortener\`
3. Set **User Name** to: \`sa\`
4. Leave password empty and click **Connect**
5. Run: \`SELECT * FROM URL_MAPPINGS;\` to see all generated short codes, long URLs, and click counters!

---

## 🐬 Switching from H2 to MySQL (Optional)
In \`src/main/resources/application.properties\`, comment out H2 and uncomment:
\`\`\`properties
spring.datasource.url=jdbc:mysql://localhost:3306/url_shortener?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
\`\`\`
`
  }
];
