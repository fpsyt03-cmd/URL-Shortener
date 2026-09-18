package com.example.urlshortener;

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
        String json = "{\"longUrl\": \"https://example.com/very/long/article?id=123\", \"expiresInHours\": 24}";

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
