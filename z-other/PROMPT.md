Fix the coding practice implementation. There are two bugs:

1. Monaco editor code persists between different questions/assessments.
   When the user moves to another question or starts a new DSA assessment, the editor must be reset and initialized with ONLY the boilerplate/template for the current question and selected language. Never carry code from a previously viewed question or previous assessment.

Expected behavior:

- Each question has its own fresh editor state.
- Changing question → reset editor.
- Starting a new assessment → reset editor.
- Changing language → load the appropriate boilerplate for the current question/language.
- Do not persist source code between questions unless explicitly required by the current assessment flow.

2. Some DSA questions do not contain valid test cases.
   Audit the existing DSA JSON files:

- resources/questions/coding/easy.json
- resources/questions/coding/medium.json
- resources/questions/coding/hard.json

Verify every question selected for coding assessment has valid test cases compatible with the existing Judge0 execution flow.

Do NOT invent a new question format or change the existing question-bank structure without checking the current implementation first.

If a question has missing/empty/invalid test cases:

- Fix the question data if the required test cases can be derived from the existing question information.
- Otherwise prevent that question from being selected until valid test cases are available.

Also verify that the backend question loader, DTOs, frontend question state, Monaco editor state, and Judge0 submission flow all use the same question ID and current question data.

Important:

- Do not change the existing DSA selection rules.
- Keep exactly 5 questions per assessment.
- Keep difficulty distribution unchanged.
- Keep solved-question exclusion and failed-question prioritization unchanged.
- Do not introduce AI-based question selection.
- Do not modify unrelated modules.

After implementing, test:
A. Complete/open an Easy question → navigate away → open another question → editor must be fresh.
B. Finish/leave Easy → start Medium → no Easy code should appear.
C. Switch between multiple questions → each editor starts with its own boilerplate.
D. Submit a question → Judge0 receives the correct current question's test cases.
E. Verify all Easy/Medium/Hard selectable questions have valid test cases.
F. Start a completely new assessment → no previous source code remains.
