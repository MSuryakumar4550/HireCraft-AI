package com.hirecraft.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirecraft.backend.dto.response.AptitudeQuestion;
import com.hirecraft.backend.dto.response.CodingQuestion;
import com.hirecraft.backend.entity.AptitudeAnswer;
import com.hirecraft.backend.entity.CodingSubmission;
import com.hirecraft.backend.enums.DifficultyLevel;
import com.hirecraft.backend.repository.AptitudeAnswerRepository;
import com.hirecraft.backend.repository.CodingSubmissionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionEngineService {

    private final AptitudeAnswerRepository aptitudeAnswerRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private List<AptitudeQuestion> aptitudeBank = new ArrayList<>();
    private List<CodingQuestion> codingBank = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            InputStream aptIs = new ClassPathResource("aptitude_questions.json").getInputStream();
            aptitudeBank = objectMapper.readValue(aptIs, new TypeReference<List<AptitudeQuestion>>() {});
            log.info("Loaded {} aptitude questions into Question Engine", aptitudeBank.size());

            InputStream codeIs = new ClassPathResource("codingQuestions.json").getInputStream();
            codingBank = objectMapper.readValue(codeIs, new TypeReference<List<CodingQuestion>>() {});
            log.info("Loaded {} coding questions into Question Engine", codingBank.size());
        } catch (Exception e) {
            log.error("Failed to load questions into Question Engine: {}", e.getMessage());
        }
    }

    public List<AptitudeQuestion> generateAptitudeQuestions(Long userId, int count) {
        // Find previously solved questions
        Set<Integer> solvedIds = aptitudeAnswerRepository.findByAptitudeAssessmentUserUserId(userId).stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsCorrect()))
                .map(AptitudeAnswer::getQuestionNo)
                .collect(Collectors.toSet());

        // Filter out solved questions
        List<AptitudeQuestion> availableQuestions = aptitudeBank.stream()
                .filter(q -> !solvedIds.contains(q.getId()))
                .collect(Collectors.toList());

        // Shuffle and pick
        Collections.shuffle(availableQuestions);
        return availableQuestions.stream().limit(count).collect(Collectors.toList());
    }

    public List<CodingQuestion> generateCodingQuestions(Long userId, DifficultyLevel assessmentDifficulty) {
        // Find previously solved coding questions
        Set<Integer> solvedIds = codingSubmissionRepository.findByCodingAssessmentUserUserId(userId).stream()
                .filter(s -> "ACCEPTED".equalsIgnoreCase(s.getStatus()))
                .map(CodingSubmission::getQuestionNo) // Assuming questionNo stores the codingQuestionId
                .collect(Collectors.toSet());

        // Categorize available questions
        List<CodingQuestion> availableEasy = codingBank.stream()
                .filter(q -> "Easy".equalsIgnoreCase(q.getDifficulty()) && !solvedIds.contains(q.getId()))
                .collect(Collectors.toList());
        List<CodingQuestion> availableMedium = codingBank.stream()
                .filter(q -> "Medium".equalsIgnoreCase(q.getDifficulty()) && !solvedIds.contains(q.getId()))
                .collect(Collectors.toList());
        List<CodingQuestion> availableHard = codingBank.stream()
                .filter(q -> "Hard".equalsIgnoreCase(q.getDifficulty()) && !solvedIds.contains(q.getId()))
                .collect(Collectors.toList());

        Collections.shuffle(availableEasy);
        Collections.shuffle(availableMedium);
        Collections.shuffle(availableHard);

        int easyNeeded = 0;
        int mediumNeeded = 0;
        int hardNeeded = 0;

        switch (assessmentDifficulty) {
            case EASY -> {
                easyNeeded = 5;
            }
            case MEDIUM -> {
                easyNeeded = 3;
                mediumNeeded = 2;
            }
            case HARD -> {
                easyNeeded = 1;
                mediumNeeded = 2;
                hardNeeded = 2;
            }
        }

        List<CodingQuestion> selected = new ArrayList<>();
        selected.addAll(availableEasy.stream().limit(easyNeeded).toList());
        selected.addAll(availableMedium.stream().limit(mediumNeeded).toList());
        selected.addAll(availableHard.stream().limit(hardNeeded).toList());

        return selected;
    }

    public int calculateTotalTimeLimit(List<CodingQuestion> questions) {
        int totalTime = 0;
        for (CodingQuestion q : questions) {
            if ("Easy".equalsIgnoreCase(q.getDifficulty())) {
                totalTime += 10;
            } else if ("Medium".equalsIgnoreCase(q.getDifficulty())) {
                totalTime += 25;
            } else if ("Hard".equalsIgnoreCase(q.getDifficulty())) {
                totalTime += 40;
            }
        }
        return totalTime;
    }

    public Optional<AptitudeQuestion> getAptitudeQuestionById(Integer id) {
        return aptitudeBank.stream().filter(q -> q.getId().equals(id)).findFirst();
    }

    public Optional<CodingQuestion> getCodingQuestionById(Integer id) {
        return codingBank.stream().filter(q -> q.getId().equals(id)).findFirst();
    }
}
