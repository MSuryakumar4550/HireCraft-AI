package com.hirecraft.backend.service;

import java.util.HashMap;
import java.util.Map;

public class SkillNormalizer {
    
    private static final Map<String, String> NORMALIZATION_MAP = new HashMap<>();

    static {
        // JavaScript ecosystem
        NORMALIZATION_MAP.put("js", "JavaScript");
        NORMALIZATION_MAP.put("react.js", "React");
        NORMALIZATION_MAP.put("reactjs", "React");
        NORMALIZATION_MAP.put("node.js", "Node.js");
        NORMALIZATION_MAP.put("nodejs", "Node.js");
        NORMALIZATION_MAP.put("ts", "TypeScript");
        NORMALIZATION_MAP.put("vue.js", "Vue");
        NORMALIZATION_MAP.put("vuejs", "Vue");
        
        // Java ecosystem
        NORMALIZATION_MAP.put("j2ee", "Java");
        NORMALIZATION_MAP.put("spring", "Spring Boot");
        NORMALIZATION_MAP.put("springboot", "Spring Boot");

        // Databases
        NORMALIZATION_MAP.put("postgres", "PostgreSQL");
        NORMALIZATION_MAP.put("mongo", "MongoDB");
        NORMALIZATION_MAP.put("sql server", "SQL");
        NORMALIZATION_MAP.put("mysql", "MySQL");

        // Cloud & DevOps
        NORMALIZATION_MAP.put("amazon web services", "AWS");
        NORMALIZATION_MAP.put("google cloud platform", "GCP");
        NORMALIZATION_MAP.put("google cloud", "GCP");
        NORMALIZATION_MAP.put("k8s", "Kubernetes");
        
        // General
        NORMALIZATION_MAP.put("ml", "Machine Learning");
        NORMALIZATION_MAP.put("ai", "Artificial Intelligence");
        NORMALIZATION_MAP.put("ci/cd", "CI/CD");
        NORMALIZATION_MAP.put("rest", "REST API");
        NORMALIZATION_MAP.put("restful", "REST API");
    }

    /**
     * Returns the normalized skill name. If no mapping exists, returns the original (trimmed & proper case).
     */
    public static String normalize(String skill) {
        if (skill == null || skill.trim().isEmpty()) {
            return "";
        }
        String cleanSkill = skill.trim().toLowerCase();
        return NORMALIZATION_MAP.getOrDefault(cleanSkill, skill.trim());
    }
}
