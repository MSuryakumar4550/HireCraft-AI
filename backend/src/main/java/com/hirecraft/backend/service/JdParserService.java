package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.ParsedJdDto;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class JdParserService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_SERVICE_URL = "http://localhost:8000/api/parse-jd";

    public ParsedJdDto parseJd(String rawText) {
        if (rawText == null || rawText.trim().isEmpty()) {
            return null;
        }
        
        // Create a dummy byte array resource to simulate a file upload to the Python service
        ByteArrayResource resource = new ByteArrayResource(rawText.getBytes()) {
            @Override
            public String getFilename() {
                return "jd.txt"; // Mock extension to pass FastAPI validation
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<ParsedJdDto> response = restTemplate.postForEntity(
                    PYTHON_SERVICE_URL, requestEntity, ParsedJdDto.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error calling Python JD Parser: " + e.getMessage());
            ParsedJdDto fallback = new ParsedJdDto();
            fallback.setJobTitle("Unknown Title");
            fallback.setExperienceRequired("Not specified");
            return fallback;
        }
    }
}
