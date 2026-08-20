# HireCraft AI — Spring Boot Backend Initialization

You are working on the **backend of HireCraft AI**, an AI-powered placement preparation platform.

Your task is to initialize and structure the complete Spring Boot backend according to the project architecture and workflow described below.

## 1. Existing Project Stack

The project is already initialized with:

- Java 21
- Spring Boot 4.1.0
- Maven
- Spring Web MVC
- Spring Data JPA / Hibernate
- PostgreSQL Driver
- Spring Security
- Spring Validation
- Spring Data Redis
- Flyway
- Spring Boot DevTools
- Spring WebSocket
- Spring AI 2.0.0
- Google Gemini integration through Spring AI

Do **not** change the existing technology stack.

Do **not** replace Spring Boot, JPA, PostgreSQL, Flyway, Redis, Spring Security, Spring AI, or any other selected technology.

---

# 2. IMPORTANT — DATABASE SOURCE OF TRUTH

There is a project file:

`DATABASE.md`

You MUST read and follow `DATABASE.md` before implementing any persistence-related code.

`DATABASE.md` is the **single source of truth for the database design**.

It contains the approved:

- Entities
- Attributes
- Primary keys
- Foreign keys
- Relationships
- Constraints
- Cardinalities
- Database design decisions

### Critical rule

**Do NOT redesign the database.**

Do not:

- Add unnecessary entities
- Remove approved entities
- Rename entities without a real technical requirement
- Add duplicate tables
- Create a separate resume entity
- Create separate voice interview tables
- Create separate execution-result tables
- Store question-bank questions in PostgreSQL
- Change the approved relationships

If something in `DATABASE.md` creates a genuine technical problem with JPA/Hibernate implementation, identify the issue clearly before making any architectural change.

---

# 3. BACKEND PACKAGE STRUCTURE

Create a clean, scalable package structure.

Use the root package:

`com.hirecraft.backend`

Create appropriate packages such as:

```text
com.hirecraft.backend
│
├── config
│
├── controller
│
├── dto
│   ├── request
│   └── response
│
├── entity
│
├── enums
│
├── exception
│
├── repository
│
├── service
│
├── service.impl
│
├── mapper
│
├── security
│
├── ai
│
├── assessment
│
├── interview
│
├── resume
│
├── coding
│
├── aptitude
│
├── report
│
├── readiness
│
└── util
```

Use good judgement if some packages should be grouped differently.

The architecture must remain clean and modular.

Do not create empty packages just for the sake of creating them. Create packages when they have a meaningful purpose.

---

# 4. ARCHITECTURE

Use a layered architecture:

```text
Controller
    ↓
Service Interface
    ↓
Service Implementation
    ↓
Repository
    ↓
JPA Entity
    ↓
PostgreSQL
```

Controllers must NOT contain business logic.

Repositories must NOT contain business logic.

Services contain application/business logic.

Service implementations implement service interfaces.

Use DTOs for API requests and responses instead of exposing JPA entities directly through REST APIs.

---

# 5. ENTITY IMPLEMENTATION

Read `DATABASE.md` and create the corresponding JPA entities.

For each database entity:

- Use `@Entity`
- Use an appropriate `@Table`
- Define the primary key correctly
- Define foreign keys correctly
- Define relationships correctly
- Use appropriate JPA relationship annotations
- Define nullable/required fields correctly
- Define unique constraints where required
- Define indexes where useful and specified
- Use appropriate column lengths/types
- Use enums for fixed-value fields
- Avoid storing database-specific logic inside entities

Do not blindly use `@Data`.

Prefer explicit entity design.

Be careful with:

- bidirectional relationships
- lazy loading
- cascading
- orphan removal
- JSON serialization recursion

Do not expose entities directly from controllers.

---

# 6. ENUMS

Create Java enums for fixed-value database fields and application states.

Examples include concepts such as:

- Account status
- Assessment mode
- Difficulty
- Assessment status
- Interview type
- Interview status
- Stage type
- Stage status
- Evaluation type
- Memory type
- Report type

Use the exact values defined by the approved database design where applicable.

Do not create arbitrary enum values that contradict the project design.

---

# 7. REPOSITORY LAYER

Create Spring Data JPA repositories for the persistent entities.

Use:

```java
JpaRepository<Entity, IdType>
```

where appropriate.

Add custom query methods only when they are actually required.

Do not create unnecessary repository methods.

Repositories should remain focused on persistence operations.

---

# 8. SERVICE LAYER

For every major backend module, create:

```text
service/
    XxxService.java

service.impl/
    XxxServiceImpl.java
```

Services should contain business logic.

Prepare service architecture for:

- User management
- Resume analysis
- Coding assessments
- Coding submissions
- Aptitude assessments
- Interview sessions
- Interview answers
- Virtual interviews
- Evaluations
- AI memory
- Readiness
- Reports

Do not implement fake business logic merely to fill methods.

Where an external integration is not implemented yet, create a clean extension point/interface instead of hardcoding mock behaviour.

---

# 9. CONTROLLER LAYER

Create REST controllers according to the actual backend modules.

Controllers should:

- Accept DTOs
- Validate requests
- Call services
- Return appropriate HTTP responses
- Never directly access repositories
- Never contain business logic

Use appropriate REST conventions.

Prepare endpoint architecture for:

```text
/api/auth
/api/users
/api/resume
/api/coding
/api/aptitude
/api/interviews
/api/virtual-interviews
/api/evaluations
/api/readiness
/api/reports
```

Do not implement every endpoint blindly if its underlying functionality has not yet been implemented.

Create only meaningful foundational endpoints at this stage.

---

# 10. DTO ARCHITECTURE

Create:

```text
dto/
├── request/
└── response/
```

Use DTOs for communication between frontend and backend.

Do not expose JPA entities directly.

Use Jakarta Bean Validation where appropriate:

```text
@NotNull
@NotBlank
@Email
@Size
@Min
@Max
```

depending on the actual field requirements.

Keep request DTOs and response DTOs separate.

---

# 11. EXCEPTION HANDLING

Create a centralized exception architecture.

Include:

```text
exception/
├── GlobalExceptionHandler
├── ResourceNotFoundException
├── BadRequestException
├── UnauthorizedException
└── ...
```

Use `@RestControllerAdvice`.

Return consistent API error responses.

Do not expose stack traces or internal implementation details to clients.

---

# 12. SECURITY FOUNDATION

The project uses:

**Spring Security + JWT**

Create the security architecture without implementing an unnecessarily complicated authentication system yet.

Prepare:

```text
security/
├── SecurityConfig
├── JwtService
├── JwtAuthenticationFilter
├── CustomUserDetailsService
└── ...
```

The authentication flow will eventually be:

```text
React
  ↓
Login
  ↓
Spring Security
  ↓
JWT
  ↓
Authenticated REST requests
  ↓
JWT filter
  ↓
SecurityContext
```

Passwords must use a secure password hashing algorithm such as BCrypt.

Never store plaintext passwords.

Do not hardcode JWT secrets.

Keep security configuration ready for environment-based secrets.

Do not disable Spring Security globally just to make development easier.

---

# 13. FLYWAY

Flyway is the database migration mechanism.

Do NOT use Hibernate to automatically modify the database schema.

Use:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Flyway should own schema creation and migration.

Create:

```text
src/main/resources/db/migration/
```

Read `DATABASE.md` before creating migration scripts.

Create the initial migration according to the approved database design.

Do not invent additional tables.

---

# 14. QUESTION BANK ARCHITECTURE

Questions are NOT PostgreSQL entities.

Question data is stored externally as JSON.

Create a suitable resource structure:

```text
src/main/resources/
└── questions/
    ├── dsa_questions.json
    ├── company_questions.json
    ├── aptitude_questions.json
    └── technical_questions.json
```

The backend must load question data from JSON at runtime.

Do not create JPA entities for questions.

Do not store the complete question bank in PostgreSQL.

The JSON question structure should support the required question information such as:

- Question
- Difficulty
- Topics
- Companies
- Constraints
- Examples
- Starter code
- Correct answer where applicable

Do not invent a completely different question architecture.

---

# 15. CODING / DSA WORKFLOW

Implement the backend architecture for coding assessments.

Rules:

### Easy

5 Easy questions.

Time:

10 minutes per question.

### Medium

3 Easy + 2 Medium.

Time:

25 minutes per question.

### Hard

2 Easy + 2 Medium + 1 Hard.

Time:

40 minutes per question.

Question selection supports:

### Topic-wise

User chooses:

- Topics
- Difficulty

Questions are randomly selected from the preferred topics.

If enough questions are not available in the selected topics, fill the remaining questions using the project's defined fallback behaviour.

### Company-wise

Support company-based question selection.

Difficulty rules remain the same.

### Submission

A coding assessment can have multiple submissions.

Store source code and Judge0 execution results according to `DATABASE.md`.

Judge0 is an external code-execution service.

Do not execute arbitrary user code directly inside the Spring Boot JVM.

Prepare a clean Judge0 integration service.

---

# 16. NO COPY/PASTE CODING RULE

The coding UI will prevent copy/paste through the frontend/editor layer.

The backend should NOT assume that frontend restrictions are a security boundary.

The backend should validate the submitted code and assessment state, but do not implement fake clipboard security on the server.

---

# 17. APTITUDE WORKFLOW

Implement the architecture for:

```text
Create assessment
      ↓
Load questions from JSON
      ↓
Assign questions
      ↓
User answers
      ↓
Store answers
      ↓
Calculate score
      ↓
Calculate accuracy
      ↓
Evaluation
      ↓
Readiness
```

Questions remain in JSON.

Only assessment/answer/result information is persisted.

---

# 18. TECHNICAL INTERVIEW

Technical interviews are voice-capable.

Technical questions can be based on:

- Resume
- Projects
- Candidate's selected field
- Core CS subjects

Examples:

- Computer Networks
- Operating Systems
- OOP
- DBMS
- SQL
- Other relevant technical areas

The backend must support interview sessions and answers.

Voice transport will use:

**Self-hosted LiveKit / WebRTC**

Do not implement LiveKit server functionality inside Spring Boot.

Spring Boot should integrate with the LiveKit-based architecture.

---

# 19. BEHAVIORAL INTERVIEW

Behavioral interviews evaluate:

- Candidate thinking
- Decision making
- Confidence
- Communication
- Grammar
- Response quality
- Behavioral characteristics

Questions should be scenario-based.

Example category:

```text
"If you are a developer and your senior does X,
how would you handle the situation?"
```

The actual AI evaluation will be implemented through the AI layer.

---

# 20. VOICE ARCHITECTURE

Voice architecture:

```text
React
   ↓
LiveKit / WebRTC
   ↓
Python LiveKit Agent
   ↓
Groq Whisper
   ↓
AI processing
   ↓
Groq Orpheus TTS
   ↓
LiveKit
   ↓
React
```

Spring Boot is the main business backend.

Python + LiveKit Agents is a separate voice-agent service.

Do NOT attempt to rewrite the Python voice agent in Java.

Spring Boot should expose the required APIs/integration points for the voice system.

---

# 21. SPRING AI / GEMINI

Spring AI is the Java backend AI integration layer.

LLM:

**Google Gemini API**

Use Spring AI rather than directly calling Gemini HTTP endpoints throughout the application.

The AI architecture should be modular.

Create a suitable AI service layer, for example:

```text
ai/
├── AiService
├── AiServiceImpl
├── ResumeAnalysisService
├── EvaluationService
└── ...
```

Avoid scattering Gemini API calls throughout controllers/services.

AI functionality will eventually support:

- Resume analysis
- Role/domain extraction
- Technical question generation/adaptation
- Behavioral question evaluation
- Coding evaluation assistance where appropriate
- Aptitude analysis
- Interview evaluation
- Personalized feedback
- AI memory generation
- Recommendations

Do not hardcode AI responses.

Do not expose the Gemini API key.

---

# 22. RESUME WORKFLOW

Resume flow:

```text
User uploads PDF
       ↓
Spring Boot
       ↓
Cloud Object Storage
       ↓
Object key stored
       ↓
Resume processing
       ↓
AI analysis
       ↓
Role/domain extraction
       ↓
Ask candidate preferred domain
       ↓
Store resulting profile information
```

The final file-storage provider is:

**Oracle Object Storage**

Do not store uploaded resume binaries inside PostgreSQL.

Prepare a storage-service abstraction so the storage provider can be implemented cleanly.

---

# 23. VIRTUAL INTERVIEW WORKFLOW

A Virtual Interview is a complete placement simulation.

Stage order:

```text
START
  ↓
APTITUDE
  ↓
DSA
  ↓
TECHNICAL
  ↓
HR / BEHAVIORAL
  ↓
FINAL EVALUATION
  ↓
REPORT
  ↓
PROGRESS
  ↓
DASHBOARD
```

The Virtual Interview must manage stage progression.

Each stage should maintain its own state while belonging to the parent Virtual Interview.

The DSA stage in the Virtual Interview uses the project's defined hard-level DSA rules.

Do not duplicate assessment data unnecessarily.

Use the relationships defined in `DATABASE.md`.

---

# 24. EVALUATION

Use the unified evaluation architecture defined in `DATABASE.md`.

Evaluation must support:

- Resume
- Coding
- Aptitude
- Technical
- Behavioral
- Virtual Interview

Evaluation results can contain:

- Score
- Percentage
- Strengths
- Weaknesses
- Feedback
- Recommendations

Only the appropriate source should be associated with an evaluation.

Do not create separate duplicate evaluation entities.

---

# 25. AI MEMORY

Implement the architecture for persistent AI memory.

Memory is used for:

- Personalized questions
- Difficulty adjustment
- Weakness detection
- Strength detection
- Learning recommendations

Examples:

```text
WEAKNESS
DSA
Dynamic Programming

STRENGTH
SQL
Joins
```

AI memory must be associated with the user.

Do not store arbitrary conversation logs as permanent memory unless explicitly required.

---

# 26. READINESS

Readiness represents placement preparation progress.

It should eventually evaluate areas such as:

- Resume
- Coding
- Company coding
- Aptitude
- Technical
- Communication
- Behavioral
- Overall placement readiness

Readiness calculations must create historical snapshots.

Do NOT overwrite previous readiness snapshots.

Support calculation versioning.

---

# 27. REPORTS

The backend must support report generation for:

- Coding
- Aptitude
- Interviews
- Virtual Interviews

Reports may contain AI-generated content.

Create an appropriate report service architecture.

Do not implement PDF generation unless the required report module is being implemented.

---

# 28. REDIS

Redis is used for:

- Cache
- Temporary assessment/session state
- Short-lived data

Do not use Redis as the primary database.

PostgreSQL remains the source of truth for persistent business data.

Create a clean Redis configuration/service layer where required.

---

# 29. REST API DESIGN

Use consistent REST conventions.

Use appropriate:

- HTTP methods
- HTTP status codes
- URL naming
- request DTOs
- response DTOs
- validation
- exception responses

Do not return raw entities.

Do not expose internal database implementation details.

---

# 30. CONFIGURATION & SECRETS

Never hardcode:

- Database passwords
- Gemini API keys
- JWT secrets
- LiveKit secrets
- Groq API keys
- Judge0 credentials
- Oracle Cloud credentials

Use configuration properties/environment variables.

Do not commit secrets to Git.

---

# 31. CODE QUALITY

Follow these rules:

- Clean architecture
- SOLID principles
- Meaningful names
- Small focused classes
- No unnecessary abstractions
- No duplicated business logic
- No hardcoded secrets
- No fake implementations
- No unnecessary comments
- No generated boilerplate that serves no purpose
- Prefer constructor injection
- Use transactions where appropriate
- Use `@Transactional` at the service layer where business transactions require it

---

# 32. DO NOT IMPLEMENT EVERYTHING AT ONCE

This is critical.

At this stage, establish the **backend foundation and architecture**.

Do NOT pretend that integrations such as:

- Gemini
- LiveKit
- Groq
- Judge0
- Oracle Object Storage

are fully implemented merely by creating empty classes.

Create clean interfaces/configuration/extension points where appropriate.

Implement actual functionality only where the required dependency/configuration is available.

---

# 33. FINAL INITIAL PROJECT STRUCTURE

The project should evolve toward a structure similar to:

```text
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── hirecraft/
│   │           └── backend/
│   │               ├── config/
│   │               ├── controller/
│   │               ├── dto/
│   │               │   ├── request/
│   │               │   └── response/
│   │               ├── entity/
│   │               ├── enums/
│   │               ├── exception/
│   │               ├── repository/
│   │               ├── service/
│   │               ├── service/
│   │               │   └── impl/
│   │               ├── mapper/
│   │               ├── security/
│   │               ├── ai/
│   │               ├── coding/
│   │               ├── aptitude/
│   │               ├── interview/
│   │               ├── resume/
│   │               ├── readiness/
│   │               ├── report/
│   │               └── util/
│   │
│   └── resources/
│       ├── application.properties
│       ├── db/
│       │   └── migration/
│       └── questions/
│           ├── dsa_questions.json
│           ├── company_questions.json
│           ├── aptitude_questions.json
│           └── technical_questions.json
│
└── test/
```

Adapt the structure if a better Spring architecture is required, but do not unnecessarily complicate it.

---

# 34. FIRST TASKS

Perform these tasks now:

1. Read `DATABASE.md`.
2. Inspect the existing Spring Boot project.
3. Verify the existing `pom.xml`.
4. Verify the existing `application.properties`.
5. Create the required package structure.
6. Create the JPA entities according to `DATABASE.md`.
7. Create the required enums.
8. Create repositories.
9. Create service interfaces.
10. Create service implementations.
11. Create foundational DTO structure.
12. Create exception handling.
13. Create foundational REST controller structure.
14. Configure JPA/Flyway correctly.
15. Create the initial Flyway migration based strictly on `DATABASE.md`.
16. Configure Redis appropriately.
17. Prepare Spring Security/JWT architecture.
18. Prepare Spring AI/Gemini architecture.
19. Prepare WebSocket configuration architecture.
20. Prepare JSON question-bank loading architecture.
21. Ensure the project compiles successfully.

---

# 35. STRICT RULES

Before making any implementation decision, check the existing project files.

Do not overwrite existing working configuration unnecessarily.

Do not modify the database design contained in `DATABASE.md`.

Do not create duplicate entities.

Do not create question entities.

Do not put business logic in controllers.

Do not expose JPA entities directly through REST.

Do not hardcode secrets.

Do not create fake AI responses.

Do not create fake Judge0/LiveKit/Groq integrations.

Do not install or introduce technologies that are not part of the approved stack.

If you find a conflict between this prompt and `DATABASE.md`, **DATABASE.md takes precedence for database design**.

If you find a conflict between this prompt and the existing `pom.xml`, inspect the dependency compatibility before changing anything.

After implementation, run Maven compilation/tests and fix genuine compilation/configuration errors.

Finally, provide a concise summary of:

- Files created
- Files modified
- Dependencies added/changed
- Database migration created
- Architecture implemented
- Remaining integrations that intentionally require later implementation
- Any issues or decisions that require my approval

Do not proceed with major architectural changes beyond this scope without asking for approval.
