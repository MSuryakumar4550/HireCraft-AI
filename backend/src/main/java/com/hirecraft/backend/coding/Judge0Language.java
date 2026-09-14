package com.hirecraft.backend.coding;

import lombok.Getter;

import java.util.Map;

/**
 * Maps HireCraft language name strings (as stored in the question JSON and used
 * by the frontend) to the numeric Judge0 language IDs required by the Judge0 API.
 *
 * <p>Language IDs are sourced from Judge0 CE v1.13.1's {@code /languages} endpoint.
 * Only languages currently listed in the coding question JSON files are included.
 */
@Getter
public enum Judge0Language {

    PYTHON("python", 71),           // Python 3.8.1
    PYTHON3("python3", 71),
    JAVA("java", 62),               // Java (OpenJDK 13.0.1)
    CPP("cpp", 54),                 // C++ (GCC 9.2.0)
    C_PLUS_PLUS("c++", 54),
    C("c", 50),                     // C (GCC 9.2.0)
    JAVASCRIPT("javascript", 63),   // JavaScript (Node.js 12.14.0)
    JS("js", 63);

    private final String languageName;
    private final int judge0Id;

    Judge0Language(String languageName, int judge0Id) {
        this.languageName = languageName;
        this.judge0Id = judge0Id;
    }

    /**
     * Resolves a language name string (case-insensitive) to its Judge0 language ID.
     *
     * @param name language name as sent by the frontend or stored in the question JSON
     * @return Judge0 language ID, or {@code -1} if the language is not supported
     */
    public static int toJudge0Id(String name) {
        if (name == null) return -1;
        String lower = name.toLowerCase().trim();
        for (Judge0Language lang : values()) {
            if (lang.languageName.equals(lower)) {
                return lang.judge0Id;
            }
        }
        return -1;
    }

    /** Returns all supported language name → Judge0 ID mappings as an unmodifiable map. */
    public static Map<String, Integer> asMap() {
        Map<String, Integer> map = new java.util.LinkedHashMap<>();
        for (Judge0Language lang : values()) {
            map.put(lang.languageName, lang.judge0Id);
        }
        return java.util.Collections.unmodifiableMap(map);
    }
}
