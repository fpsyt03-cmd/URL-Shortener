package com.example.urlshortener;

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
