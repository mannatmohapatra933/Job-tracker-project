package com.example.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;

    public AiController() {
        this.restTemplate = new RestTemplate();
    }

    @PostMapping("/match")
    public ResponseEntity<?> matchResume(@RequestBody Map<String, Object> payload) {
        String cleanApiKey = geminiApiKey == null ? "" : geminiApiKey.trim().replaceAll("\\s+", "");
        
        if (cleanApiKey.isEmpty() || cleanApiKey.equals("dummy_key") || cleanApiKey.equals("your_gemini_api_key_here")) {
            return ResponseEntity.status(500).body("{\"error\": \"Gemini API key is not configured or is invalid.\"}");
        }
        
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + cleanApiKey;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.err.println("Google API Error: " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Internal AI Match Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": {\"message\": \"Internal Server Error: " + e.getMessage() + "\"}}");
        }
    }
}
