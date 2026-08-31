# Project Blueprint & Context Summary (HireCraft AI Aptitude Module)

**Context for New Agent Session:** This document summarizes the finalized architecture, product flow, and technical strategy for building the AI Aptitude Test module. 

## 1. Core Architecture Strategy (The Lightweight Model)
We are adopting a **"Pre-Computed / Lightweight Microservice"** architecture (similar to PrepInsta).
*   **No Real-Time AI Generation on the Live Server:** To keep server costs low and guarantee 100% mathematical accuracy, we will NOT use live LLMs (like Ollama or OpenAI) to generate questions or explanations during the exam.
*   **The Offline Engine:** AI will be used *offline* (via a local Python script) to bulk-generate thousands of questions and their step-by-step HTML explanations.
*   **The Live Microservice:** A fast, lightweight Python FastAPI server will simply fetch these pre-computed questions and explanations from a PostgreSQL database.

## 2. Database Schema (PostgreSQL)
PostgreSQL is mandatory for scale and relation tracking. The core schema requires:
*   `Questions`: `id`, `category` (e.g., Quant), `topic` (e.g., Fractions), `difficulty`, `time_limit_seconds`, `question_text`, `options_json`, `correct_answer`, `explanation_html`.
*   `User_Progress`: `user_id`, `topic`, `questions_attempted`, `correct_answers`, `accuracy_percentage`.

## 3. Product UX & Onboarding Flow
The target audience includes struggling 3rd-year students, so the platform shifts from a pure "Assessment" tool to a "Diagnostic & Learning" tool.
*   **Hybrid Onboarding:** We ask the user what topics they struggle with, but immediately verify it with an objective 10-15 question **Diagnostic Exam**.
*   **True Results Scorecard:** The platform provides brutally honest scores (e.g., "10% in Geometry").
*   **Guided Levels (Gamification):** Based on the diagnostic, the system locks advanced levels and forces them to pass "Level 1" of their weak topics, building confidence.
*   **The AI Tutor Review:** After an exam, the student reviews wrong answers. The UI displays the pre-computed `explanation_html` to teach them exactly how to solve it step-by-step.

## 4. Execution Roadmap (The Next Steps)
1.  **Phase 1: Database Setup:** Initialize PostgreSQL and build the `Users`, `Questions`, and `User_Progress` tables.
2.  **Phase 2: Offline Pipeline:** Write the Python script to auto-generate the first 100+ questions/explanations and seed the database.
3.  **Phase 3: Backend API:** Build the FastAPI endpoints (`/diagnostic`, `/submit_exam`, `/get_tutor_explanation`).
4.  **Phase 4: Frontend UI:** Connect the existing React/Next.js dashboard to these endpoints, building the Radar Chart and Exam Arena.
