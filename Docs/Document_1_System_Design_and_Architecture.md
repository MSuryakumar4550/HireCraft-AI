# HireCraft AI — System Design & Architecture
**Document 1: Master Technical Specification & Architecture Reference**

---

## 1. Introduction

### 1.1 Project Identity
* **Project Name:** HireCraft AI
* **Category:** AI-Powered Personalized Career Preparation & Adaptive Interview Platform
* **Primary Target Audience:** College Students, Placement Aspirants, Software Developer Candidates, Freshers, and Job Seekers.
* **Core Value Proposition:** HireCraft AI transforms fragmented career preparation into a continuous, personalized, closed-loop AI coaching system. It connects Resume ATS Scoring $\rightarrow$ Skill Gap Analysis $\rightarrow$ Targeted Prep (Aptitude, DSA, Core CS) $\rightarrow$ Adaptive Voice/Text Mock Interviews $\rightarrow$ Multi-Dimensional Evaluation $\rightarrow$ Long-Term Candidate Memory $\rightarrow$ Dynamic Next-Best-Action Recommendations.

### 1.2 Elevator Pitch
> *"Most students prepare for placements using disconnected platforms—one tool for resume analysis, another for aptitude, LeetCode for DSA, YouTube for Core CS, and friends for mock interviews. None of these tools talk to each other.*
> 
> *HireCraft AI brings all these into **one unified system governed by an AI Orchestrator**. It analyzes the candidate's resume and target job role, identifies specific skill gaps, builds a custom preparation path, conducts adaptive voice mock interviews, evaluates technical and communication performance, remembers weaknesses across sessions, and continuously recommends what the candidate should practice next. **It is not just an interview chatbot; it is a complete, closed-loop AI career coach.***"

### 1.3 Scope & Purpose of Document
This document defines the comprehensive System Design & Technical Architecture for **HireCraft AI**. It provides full architectural coverage across system goals, functional and non-functional requirements, high-level and component architecture, AI orchestration logic, hybrid memory mechanics, technology selection, security, scalability, and current development status.

---

## 2. System Objectives

### 2.1 Strategic Product Goals
1. **End-to-End Personalization:** Deliver a continuous preparation journey customized to each candidate's current knowledge, target role, and past session performance.
2. **Deterministic Quality & LLM Efficiency:** Eliminate LLM hallucinations and reduce token overhead by combining pre-curated subject question banks with dynamic runtime AI evaluation.
3. **Low-Latency Voice Interactions:** Enable natural, voice-driven mock interviews with sub-100ms LLM processing latency using fast provider adapters (e.g., Groq).
4. **Persistent Candidate Memory:** Maintain long-term candidate state across sessions so the platform never re-tests mastered topics and actively targets known weaknesses.
5. **Fair Multi-Dimensional Assessment:** Evaluate technical domain knowledge (70%) independently from communication clarity (30%) to avoid penalizing non-native speakers fairly.

### 2.2 Problem Statement vs. HireCraft AI Solution

| Aspect | Fragmented Status Quo | HireCraft AI Closed-Loop Solution |
| :--- | :--- | :--- |
| **Preparation Tools** | Disconnected tools (Resume checkers, DSA judges, YouTube videos) | Single unified platform with AI Orchestration |
| **Session Memory** | Zero memory across tools or sessions | Central Candidate Memory tracking topic-level proficiency |
| **Interview Coaching** | Static non-adaptive mock interviews or human dependent | Real-time adaptive voice AI interviewer that asks deep follow-ups |
| **Evaluation Criteria** | Vague high-level scores | Rubric-based Technical Coverage (70%) + Speech Analytics (30%) |
| **Next Action** | Candidate must guess what to study next | Dynamic daily "Next Best Action" schedule based on active gaps |

### 2.3 Core Architectural Objectives
* **Modular Monolith Architecture:** Maintain high domain cohesion and developer efficiency during initial phases while allowing clean extraction into microservices if needed.
* **LLM Provider Independence:** Abstract all LLM calls behind a unified interface using the Strategy Pattern to eliminate single-vendor lock-in.
* **Hybrid Storage Architecture:** Combine MySQL relational integrity for core entities with native JSON column structures for dynamic skill matrices and rubrics.

---

## 3. Functional Requirements

### 3.1 Profiling & Candidate Memory (FR-1)
* **FR-1.1:** System shall capture user credentials, target job role, experience level, and educational background.
* **FR-1.2:** System shall maintain a persistent Candidate Memory tracking proficiency scores across Core CS topics (DBMS, CN, OOPS, OS), DSA, and Aptitude.
* **FR-1.3:** System shall automatically update memory scores after every completed practice or mock interview session.

### 3.2 Resume Parsing & ATS Engine (FR-2)
* **FR-2.1:** System shall accept PDF and Word resume uploads, extracting raw text, contact information, skills, and work history.
* **FR-2.2:** System shall calculate an overall ATS Compatibility Score based on Skill Match (40%), Keyword Match (30%), Formatting Structure (20%), and Impact Quantification (10%).
* **FR-2.3:** System shall identify missing keywords and technical skill gaps relative to the candidate's target job role.

### 3.3 Curated Subject Question Bank & Practice (FR-3)
* **FR-3.1:** System shall maintain pre-curated question banks for major Core CS subjects (`cn.json`, `dbms.json`, `oops.json`, `os.json`).
* **FR-3.2:** Each question bank entry shall specify difficulty level, expected concept list, and weighted evaluation rubric.
* **FR-3.3:** System shall serve targeted practice sessions calibrated to the candidate's current difficulty tier.

### 3.4 Adaptive AI Voice/Text Mock Interview Engine (FR-4)
* **FR-4.1:** System shall support real-time voice input via Web Speech API / MediaRecorder and synthesize AI responses via Speech Synthesis / Audio TTS.
* **FR-4.2:** System shall dynamically adapt interview question difficulty based on the candidate's live response accuracy.
* **FR-4.3:** System shall generate context-aware, answer-dependent follow-up questions targeting missing rubric concepts.

### 3.5 Multi-Dimensional Evaluation Engine (FR-5)
* **FR-5.1:** System shall score technical correctness (70%) by benchmarking responses against predefined concept rubrics.
* **FR-5.2:** System shall score communication performance (30%) measuring speaking pace (words/min), filler word density, and structure.
* **FR-5.3:** System shall generate detailed session feedback detailing strengths, missing concepts, and suggested answers.

### 3.6 Dynamic Recommendation Engine (FR-6)
* **FR-6.1:** System shall compute a daily readiness score comparing current Candidate Memory to target role requirements.
* **FR-6.2:** System shall generate a personalized daily preparation plan specifying target topics, estimated duration, and recommended practice type.

---

## 4. Non-Functional Requirements

### 4.1 Performance & Latency (NFR-1)
* **NFR-1.1:** LLM response generation for live interview turns shall execute with sub-100ms latency using high-speed adapters (Groq Llama-3-70b).
* **NFR-1.2:** Audio transcription (STT) and voice synthesis (TTS) processing delay shall not exceed 1.5 seconds per turn.
* **NFR-1.3:** API endpoint response times for dashboard analytics and question retrieval shall remain below 200ms.

### 4.2 Reliability & Fault Tolerance (NFR-2)
* **NFR-2.1:** System shall achieve 99.5% service uptime.
* **NFR-2.2:** System shall implement automatic LLM provider failover (Groq $\rightarrow$ Gemini 1.5 $\rightarrow$ OpenAI) if primary provider requests timeout or error out.
* **NFR-2.3:** System shall handle browser disconnects gracefully during active mock interviews, preserving transcript state up to the last turn.

### 4.3 Security & Data Privacy (NFR-3)
* **NFR-3.1:** All candidate authentication shall use stateless JSON Web Tokens (JWT) with BCrypt password hashing.
* **NFR-3.2:** Candidate data, resumes, and interview transcripts shall be strictly isolated per candidate user ID.
* **NFR-3.3:** Uploaded resume files and audio buffers shall be sanitized against malicious scripts and unauthorized directory traversal.

### 4.4 Usability & Extensibility (NFR-4)
* **NFR-4.1:** UI shall follow modern responsive design standards, providing intuitive navigation across desktop and tablet viewports.
* **NFR-4.2:** Architecture shall allow addition of new Core CS subject modules simply by adding curated JSON question banks without backend code refactoring.

---

## 5. High-Level Architecture

### 5.1 Architectural Pattern: Modular Monolith
HireCraft AI adopts a **Modular Monolith** architecture. Backend logic resides inside a single Spring Boot application divided into strictly bounded domains (`auth`, `resume`, `interview`, `practice`, `memory`, `analytics`). This eliminates microservice network latency while ensuring clean code separation.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       CLIENT TIER (React 18 + TS)                       │
│      [ Dashboard UI ]    [ Audio Voice Recorder ]    [ Practice Portal ]│
└────────────────────┬────────────────────────────────────┘
                                     │ HTTPS REST / WebSockets
┌────────────────────▼────────────────────────────────────┐
│                    API & SECURITY TIER (Spring Boot 3)                  │
│      [ JwtAuthFilter ]    [ AuthCtrl ]    [ InterviewCtrl ]   [ ResumeCtrl ]│
└────────────────────┬────────────────────────────────────┘
                                     │ Domain Service Calls
┌────────────────────▼────────────────────────────────────┐
│                    CORE INTELLIGENCE & SERVICE LAYER                    │
│  [ AI Orchestrator ] [ Candidate Memory ] [ ATS Engine ] [ Eval Engine ]│
└──────────────────┬─────────────────────────────────┬────────────────────┘
                   │                                 │
┌──────────────────▼──────────────┐       ┌──────────▼────────────────────┐
│  AI INTEGRATION LAYER (Strategy)│       │       PERSISTENCE LAYER       │
│  [ Groq ]  [ Gemini ]  [ OpenAI ]│       │  [ MySQL 8.0 ]  [ Vector DB ] │
└─────────────────────────────────┘       └───────────────────────────────┘
```

---

## 6. Component Architecture

### 6.1 Layered System Breakdown

1. **Frontend Layer (Client App):** Built using React 18, TypeScript, and Vite. Handles user interaction, dashboard analytics visualization, and audio capture via HTML5 MediaRecorder / Web Speech API.
2. **API & Security Layer:** Spring Boot REST Controllers secured via Spring Security 6 and stateless JWT tokens. Enforces request validation and CORS policies.
3. **Core Intelligence & Service Layer:**
   - `Orchestrator`: Coordinates session state, determines difficulty escalation, and invokes evaluation.
   - `MemoryService`: Manages candidate proficiency matrices and updates MySQL JSON records.
   - `ResumeService`: Extracts resume text, matches target role keywords, and computes ATS scores.
   - `InterviewEngine`: Manages multi-turn voice/text interview dialog state.
   - `EvaluationService`: Benchmarks candidate transcripts against question rubrics.
   - `RecommendationEngine`: Calculates daily readiness and generates preparation tasks.
4. **AI Integration Layer:** Unified `LLMService` interface providing Strategy Pattern adapters for Groq, Gemini 1.5, and OpenAI APIs.
5. **Persistence Layer:** MySQL 8.0 storing relational entities (`users`, `sessions`, `questions`) and native JSON columns (`topic_proficiency`, `evaluation_rubric`, `missing_skills`).

---

## 7. AI Architecture

### 7.1 Multi-Agent Orchestration Model
Although packaged within unified Spring Boot services, the platform operates logically as specialized **AI Agents** coordinated by the **Central AI Orchestrator**:

```
                       ┌──────────────────────────────┐
                       │    CENTRAL AI ORCHESTRATOR   │
                       └──────────────┬───────────────┘
                                      │
 ┌──────────────┬──────────────┬──────┴──────┬──────────────┬──────────────┐
 ▼              ▼              ▼             ▼              ▼              ▼
[Memory Agent] [Resume Agent] [Job Agent] [Prep Agents] [Interview Agent][Eval Agent]
```

1. **Career Memory Agent:** Tracks historical performance, active weak areas, and topic mastery.
2. **Resume & ATS Agent:** Extracts skills, formats, and keyword matches from candidate resumes.
3. **Job Analysis Agent:** Maps target job descriptions into required skill vectors.
4. **Preparation Agents:** Delivers calibrated practice questions from curated subject banks.
5. **Adaptive Interview Agent:** Conducts live interview dialogue, selecting questions and generating dynamic follow-ups.
6. **Evaluation Agent:** Scores technical completeness against rubrics and measures communication pace.
7. **Recommendation Agent:** Computes readiness score and formulates daily action plans.

### 7.2 Strategy Pattern for LLM Provider Independence

```java
public interface LLMService {
    String generateResponse(String systemPrompt, String userPrompt);
    EvaluationResult evaluateAnswer(String question, String answer, List<String> expectedConcepts);
}
```

* **Groq Adapter (Default for Interviewing):** Delivers sub-100ms response time using Llama-3 70B, enabling seamless speech interaction.
* **Gemini 1.5 Adapter (Default for Resume & Evaluation):** Delivers high reasoning capacity and multi-modal document analysis for complex resume processing.
* **OpenAI Adapter (Fallback):** Provides seamless failover redundancy in case of rate limits or provider downtime.

### 7.3 Hybrid Dual-Layer Memory Model
* **Structured Memory (RDBMS):** Stores quantitative metrics (topic scores, test attempt counts, pass/fail thresholds) in native MySQL `JSON` columns.
* **Semantic Memory (Vector RAG):** Stores verbatim transcripts of candidate explanations and past interview feedback as vector embeddings. During interviews, semantic search checks whether the candidate is repeating past conceptual mistakes across sessions.

---

## 8. Data Flow

### 8.1 Master Candidate Journey Sequence

```
Candidate            React UI            API Gateway          Orchestrator         Question Bank        Eval Engine          Candidate Memory
    │                   │                     │                     │                    │                   │                      │
    │──1. Upload Resume─►│                     │                     │                    │                   │                      │
    │                   │──2. POST /resume───►│                     │                    │                   │                      │
    │                   │                     │──3. Extract Skill──►│                    │                   │                      │
    │                   │◄──4. ATS Score & Gap┤                     │                    │                   │                      │
    │                   │                     │                     │                    │                   │                      │
    │──5. Start Interview────────────────────►│                     │                    │                   │                      │
    │                   │                     │──6. Init Session───►│                    │                   │                      │
    │                   │                     │                     │──7. Fetch State───►│                   │                      │
    │                   │                     │                     │◄──8. Weak: DBMS────┤                   │                      │
    │                   │                     │                     │──9. Get Q (DBMS)──►│                   │                      │
    │                   │◄──10. AI Audio Q────┤                     │◄──11. Question ────┘                   │                      │
    │                   │                     │                     │                    │                   │                      │
    │──12. Speak Answer►│                     │                     │                    │                   │                      │
    │                   │──13. Stream Audio──►│                     │                    │                   │                      │
    │                   │                     │──14. Evaluate Answer────────────────────►│                   │                      │
    │                   │                     │                     │                    │◄──15. Score 85%───┤                      │
    │                   │                     │                     │──16. Update Memory─────────────────────────────────────────────►│
    │                   │◄──17. Session Report ─────────────────────┴──────────────────────────────────────────────────────────────────┘
```

---

## 9. Module Architecture

### 9.1 Module 2: Resume Parser & ATS Scoring Formula
The ATS Scoring Engine evaluates candidate resumes using the following weighted formula:

$$\text{ATS Score} = (0.40 \times \text{Skill Match}) + (0.30 \times \text{Keyword Match}) + (0.20 \times \text{Structure Score}) + (0.10 \times \text{Impact Score})$$

### 9.2 Module 3: Structured Question Banks (`Core_Subjects`)
Curated question banks (`cn.json`, `dbms.json`, `oops.json`, `os.json`) enforce deterministic evaluation rubrics:

```json
{
  "id": "DBMS_NORM_02",
  "subject": "DBMS",
  "topic": "Normalization",
  "difficulty": "INTERMEDIATE",
  "question": "Explain 3rd Normal Form (3NF) and how it differs from BCNF.",
  "expected_concepts": [
    "Removal of transitive dependencies",
    "Super key requirement for BCNF",
    "Functional dependency X -> Y"
  ],
  "rubric": {
    "transitive_dependency_weight": 40,
    "bcnf_superkey_weight": 40,
    "examples_weight": 20
  }
}
```

### 9.3 Module 5: Multi-Dimensional Evaluation Matrix

```
                        EVALUATION SCORECARD BREAKDOWN
┌──────────────────────────────────────┬──────────────────────────────────────┐
│       TECHNICAL DIMENSION (70%)      │     COMMUNICATION DIMENSION (30%)   │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Concept Coverage (% of Rubric)     │ • Speaking Pace (Words per minute)   │
│ • Technical Precision & Accuracy     │ • Structural Clarity (STAR Method)   │
│ • Keyword & Terminology Presence     │ • Filler Density (um, like count)    │
│ • Edge Case & Exception Awareness    │ • Response Conciseness & Directness  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 10. Technology Stack

### 10.1 Technology Selection Matrix

| Tier / Component | Technology | Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 18.x | Component modularity, high performance DOM rendering |
| **Language / Build** | TypeScript / Vite | 5.x / 5.x | Static typing safety, ultra-fast HMR build pipeline |
| **Audio Processing** | Web Speech API / MediaRecorder | Native | Browser-native voice capture without external plugin overhead |
| **Backend Framework** | Java / Spring Boot | 21 / 3.2.x | Enterprise robustness, strong concurrency, layered architecture |
| **Security** | Spring Security / JWT | 6.x | Stateless API authorization with token validation |
| **Database** | MySQL | 8.0 | Hybrid relational integrity with native JSON support |
| **AI LLM Providers** | Groq / Gemini / OpenAI | API | Multi-provider fallback strategy (Sub-100ms latency via Groq) |

---

## 11. Security Architecture

### 11.1 Stateless JWT Authentication
* **Token Issuance:** Upon successful BCrypt password verification, system issues a signed JWT containing user ID and system roles.
* **Per-Request Security:** `JwtAuthFilter` intercepts incoming requests, extracts `Authorization: Bearer <token>`, validates signature against server secret, and populates `SecurityContextHolder`.

### 11.2 Data Isolation & Defense
* **User Isolation:** All JPA repositories append explicit `WHERE user_id = :userId` constraints to prevent cross-account data leaking.
* **Sanitization:** Uploaded filenames are sanitized against path traversal attacks (`../`), and PDF text extraction runs inside isolated sandbox buffers.

---

## 12. Scalability Considerations

### 12.1 Backend Horizontal Scaling
The Spring Boot backend maintains zero in-memory session state. All session attributes reside in MySQL or Redis. Multiple backend instances can be deployed behind a Round-Robin Load Balancer (e.g., NGINX) to handle linear traffic growth.

### 12.2 Database Optimization
* **Indexing Strategy:** Composite indexes placed on `(user_id, created_at)` and `(subject_code, difficulty)`.
* **JSON Indexing:** MySQL functional indexes applied to frequently queried JSON keys (e.g., `(CAST(topic_proficiency->'$.DBMS' AS UNSIGNED))`).

---

## 13. Current Development Status

### 13.1 Phase-Wise Implementation Roadmap

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: MVP CORE ARCHITECTURE (COMPLETED / REVIEW 2 DELIVERABLE)         │
│  [x] Master System Design & Database Specification                       │
│  [x] Curated Core CS Question Banks (CN, DBMS, OOPS, OS JSON Banks)      │
│  [x] Spring Boot 3 API Layer & JWT Security Configuration                │
│  [x] React + TypeScript + Vite Frontend Foundation                       │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: ADAPTIVE ENGINE & MEMORY PERSISTENCE (IN PROGRESS)              │
│  [ ] Resume Parser & ATS Scoring Integration                             │
│  [ ] Dual-Layer Candidate Memory Persistence                             │
│  [ ] Adaptive Follow-up Logic & Dynamic Recommendation Engine            │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: ADVANCED VOICE & ANALYTICS (FINAL MILESTONE)                    │
│  [ ] Real-Time Speech Synthesis & WebRTC Voice Interface                 │
│  [ ] Communication Analytics (Pace, Filler word counter)                 │
│  [ ] Comprehensive Placement Readiness Dashboard                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---
*Document 1 — HireCraft AI System Design & Architecture Specification.*
