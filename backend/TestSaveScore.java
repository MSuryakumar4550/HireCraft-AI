package com.hirecraft.backend;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TestSaveScore {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        ObjectMapper mapper = new ObjectMapper();
        
        // 1. Register
        Map<String, String> regBody = Map.of(
            "firstName", "T", "lastName", "U",
            "email", "t" + System.currentTimeMillis() + "@e.com",
            "password", "p"
        );
        HttpRequest regReq = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:8080/api/auth/register"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(regBody)))
            .build();
            
        HttpResponse<String> regResp = client.send(regReq, HttpResponse.BodyHandlers.ofString());
        if (regResp.statusCode() != 200 && regResp.statusCode() != 201) {
            System.out.println("Auth failed: " + regResp.statusCode() + " " + regResp.body());
            return;
        }
        
        String token = (String) mapper.readValue(regResp.body(), Map.class).get("token");
        
        // 2. Save score
        Map<String, Object> scoreBody = Map.of(
            "score", 10,
            "totalQuestions", 15,
            "accuracy", 66.67
        );
        HttpRequest scoreReq = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:8080/api/aptitude/assessments/save-score"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token)
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(scoreBody)))
            .build();
            
        HttpResponse<String> scoreResp = client.send(scoreReq, HttpResponse.BodyHandlers.ofString());
        System.out.println("Score Response: " + scoreResp.statusCode() + " " + scoreResp.body());
    }
}
