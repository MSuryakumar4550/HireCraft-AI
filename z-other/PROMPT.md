MODEL: Gemini Pro High 3.1

We need to fix 3 concrete problems in the Coding Practice assessment flow.

IMPORTANT:

- Do not redesign the coding platform.
- Do not modify Judge0 execution.
- Do not modify the working SolutionWrapperService.
- Do not modify test cases.
- Do not modify authentication.
- Do not touch unrelated modules.
- Make only the minimum changes required.
- Do not spend a long time on broad investigation.

PROBLEMS:

1. THERE IS NO NEXT/PREVIOUS QUESTION NAVIGATION

Current Coding Practice assessment shows "Question X of 5", but the user cannot move to the next question.

Implement clear question navigation.

Requirements:

- Add Previous and Next controls to the assessment UI.
- Previous disabled on question 1.
- Next disabled on question 5.
- Clicking Next changes the current question.
- Clicking Previous returns to the previous question.
- Preserve each question's current editor code while navigating.
- Changing questions must load that question's starter code only when the user has not already edited/saved code for that question.
- Existing timer must continue without resetting.
- Existing anti-cheat/session behavior must continue.
- Do not change the existing assessment question order.

2. REMOVE "COMPANY WISE" FROM CODING PRACTICE

Under the Coding Practice sidebar there is currently:

- Difficulty Wise
- Company Wise

Remove "Company Wise" from the Coding Practice navigation.

Requirements:

- Remove the visible sidebar item.
- Remove any unused coding-company navigation/link associated with this item.
- Do NOT delete unrelated Company Readiness functionality elsewhere in the application.
- Do NOT break routing for unrelated modules.
- Do not redesign the sidebar.

3. FINISH EXAM MUST SHOW THE RESULT/SCORE

Currently clicking Finish Exam does not show the coding assessment score/result.

Implement the proper completion flow using the EXISTING backend/API architecture.

Requirements:

- When Finish Exam is clicked, complete the current coding assessment through the existing backend API.
- The backend must calculate/use the actual coding submission results already stored for the assessment.
- The result page/summary must show at minimum:
  - total questions
  - answered/submitted questions
  - correct/passed questions
  - wrong/failed questions
  - final score/percentage
  - overall assessment result/status
- Do NOT calculate the final score from frontend-only state if backend submission data already exists.
- Use the existing coding assessment/submission APIs where possible.
- Do NOT create duplicate scoring logic if an existing backend score/status mechanism already exists.
- After completion, the user must be able to see the result immediately.
- Do NOT expose hidden test case inputs or expected outputs.
- Preserve all existing submission data.
- Preserve the existing AI-memory update behavior.

IMPORTANT:
Before changing code, briefly inspect the existing CodingPracticePage flow, CodingController, CodingAssessmentService, CodingSubmissionService, and existing submission/result DTOs to identify the existing completion endpoint and result data.

Then make the smallest implementation.

VALIDATION — KEEP THIS SHORT:

1. Build backend.
2. Build frontend.
3. Open Coding Practice → Easy.
4. Verify:
   - Question 1 → Next → Question 2
   - Previous returns to Question 1
   - timer does not reset
   - Company Wise is no longer shown
5. Submit at least one correct question.
6. Finish Exam.
7. Confirm the result/score screen appears and displays real values.

Do NOT run large automated test suites.
Do NOT modify unrelated modules.

FINAL REPORT:

- navigation: PASS/FAIL
- Company Wise removed: PASS/FAIL
- Finish Exam result: PASS/FAIL
- backend build: PASS/FAIL
- frontend build: PASS/FAIL
- files changed
- remaining blocker (one sentence)
