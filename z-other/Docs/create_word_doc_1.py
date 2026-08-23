import os
import sys

# Auto-install python-docx if not installed
try:
    import docx
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import qn, nsdecls
except ImportError:
    print("python-docx not found. Attempting automatic installation...")
    os.system(f"{sys.executable} -m pip install python-docx")
    import docx
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import qn, nsdecls

# --- EXECUTIVE DESIGN SYSTEM COLOR PALETTE ---
HEX_PRIMARY = "1F4E78"     # Deep Navy
HEX_SECONDARY = "2F5597"   # Steel Blue
HEX_ACCENT = "D9E1F2"      # Ice Blue Accent
HEX_DARK_TEXT = "262626"   # Charcoal
HEX_BG_LIGHT = "F2F6FA"    # Callout / Shading
HEX_ZEBRA = "F9FBFD"       # Table Zebra Striping
HEX_BORDER = "CCCCCC"      # Subtle Gray Border
HEX_MUTED = "595959"       # Muted Gray

COLOR_PRIMARY = RGBColor(31, 78, 120)
COLOR_SECONDARY = RGBColor(47, 85, 151)
COLOR_DARK_TEXT = RGBColor(38, 38, 38)
COLOR_MUTED = RGBColor(89, 89, 89)

FONT_HEADING = "Calibri Light"
FONT_BODY = "Calibri"
FONT_CODE = "Consolas"

def set_cell_background(cell, hex_color):
    """Sets background fill color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets internal cell margins (padding) in dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    """Sets subtle outer and inner borders on tables."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="none"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def set_left_border(cell, color=HEX_PRIMARY, sz="36"):
    """Applies a thick left accent border to a callout cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:top w:val="none"/>
            <w:right w:val="none"/>
            <w:bottom w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)

def add_heading_1(doc, text):
    """Adds a styled H1 heading with primary color and bottom space."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = FONT_HEADING
    run.font.size = Pt(18)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY
    return p

def add_heading_2(doc, text):
    """Adds a styled H2 heading with secondary color."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = FONT_HEADING
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = COLOR_SECONDARY
    return p

def add_heading_3(doc, text):
    """Adds a styled H3 heading."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = FONT_BODY
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = COLOR_DARK_TEXT
    return p

def add_body_paragraph(doc, text, bold_prefix=None, italic=False):
    """Adds a standard styled body paragraph."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15

    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = FONT_BODY
        r_bold.font.size = Pt(11)
        r_bold.font.bold = True
        r_bold.font.color.rgb = COLOR_DARK_TEXT

    run = p.add_run(text)
    run.font.name = FONT_BODY
    run.font.size = Pt(11)
    run.font.italic = italic
    run.font.color.rgb = COLOR_DARK_TEXT
    return p

def add_bullet_item(doc, text, bold_prefix=None):
    """Adds a bullet point with custom styling."""
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15

    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = FONT_BODY
        r_bold.font.size = Pt(11)
        r_bold.font.bold = True
        r_bold.font.color.rgb = COLOR_DARK_TEXT

    run = p.add_run(text)
    run.font.name = FONT_BODY
    run.font.size = Pt(11)
    run.font.color.rgb = COLOR_DARK_TEXT
    return p

def add_callout_box(doc, text, title=None):
    """Creates a shaded callout box with a left accent border."""
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, HEX_BG_LIGHT)
    set_left_border(cell, HEX_PRIMARY, sz="36")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15

    if title:
        rt = p.add_run(f"💡 {title}\n")
        rt.font.name = FONT_BODY
        rt.font.size = Pt(11)
        rt.font.bold = True
        rt.font.color.rgb = COLOR_PRIMARY

    r = p.add_run(text)
    r.font.name = FONT_BODY
    r.font.size = Pt(10.5)
    r.font.italic = True
    r.font.color.rgb = COLOR_DARK_TEXT

    # Add spacing after callout
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(6)

def add_code_block(doc, code_text):
    """Creates a styled monospace block for architecture diagrams & JSON."""
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, "2D3748")  # Slate Gray / Dark Code Panel
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05

    run = p.add_run(code_text)
    run.font.name = FONT_CODE
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(240, 244, 248)

    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(6)

def add_styled_table(doc, headers, data, col_widths=None):
    """Generates an executive table with solid header, zebra striping, and custom borders."""
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table, color=HEX_BORDER, sz="4")

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        cell = hdr_cells[i]
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, top=140, bottom=140, left=150, right=150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(title)
        run.font.name = FONT_BODY
        run.font.size = Pt(10)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

    # Data Rows
    for row_idx, row_data in enumerate(data):
        row_cells = table.rows[row_idx + 1].cells
        bg_color = HEX_ZEBRA if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(row_data):
            cell = row_cells[col_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(str(cell_value))
            run.font.name = FONT_BODY
            run.font.size = Pt(9.5)
            run.font.color.rgb = COLOR_DARK_TEXT

    # Apply column widths if provided
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)

    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(6)

def build_document():
    doc = Document()

    # Set page margins (1 inch around)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("HireCraft AI — Document 1: System Design & Architecture")
        hrun.font.name = FONT_BODY
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = COLOR_MUTED

        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun1 = fp.add_run("HireCraft AI Platform Specification  |  Confidential & Proprietary")
        frun1.font.name = FONT_BODY
        frun1.font.size = Pt(8.5)
        frun1.font.color.rgb = COLOR_MUTED

    # --- COVER PAGE / TITLE BLOCK ---
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(24)
    title_p.paragraph_format.space_after = Pt(4)
    trun = title_p.add_run("HireCraft AI — System Design & Architecture")
    trun.font.name = FONT_HEADING
    trun.font.size = Pt(24)
    trun.font.bold = True
    trun.font.color.rgb = COLOR_PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(18)
    srun = sub_p.add_run("Document 1: Master Technical Specification & System Architecture Reference")
    srun.font.name = FONT_HEADING
    srun.font.size = Pt(13)
    srun.font.color.rgb = COLOR_SECONDARY

    # Metadata Panel Table
    meta_data = [
        ["Project Name", "HireCraft AI"],
        ["Document Title", "Document 1 — System Design & Architecture"],
        ["Target Audience", "Review Panel, Architecture Lead, Development Team"],
        ["Author / Team", "HireCraft AI Engineering Team"],
        ["Document Version", "v1.0 (Final Master Release)"],
        ["Last Updated", "August 2026"]
    ]
    add_styled_table(doc, ["Metadata Field", "Specification Detail"], meta_data, col_widths=[2.2, 4.3])

    # Divider line
    add_callout_box(
        doc,
        "This document presents the complete architectural specification for HireCraft AI. It covers system objectives, functional and non-functional requirements, modular monolith architecture, AI multi-agent orchestration, hybrid dual-layer memory mechanics, technology stack, security, scalability, and implementation roadmap.",
        title="Executive Summary & Master Reference Scope"
    )

    # --- SECTION 1 ---
    add_heading_1(doc, "1. Introduction")
    add_heading_2(doc, "1.1 Project Identity")
    add_bullet_item(doc, "HireCraft AI", bold_prefix="Project Name: ")
    add_bullet_item(doc, "AI-Powered Personalized Career Preparation & Adaptive Interview Platform", bold_prefix="Category: ")
    add_bullet_item(doc, "College Students, Placement Aspirants, Freshers, Software Candidates.", bold_prefix="Primary Target Audience: ")
    add_bullet_item(doc, "HireCraft AI transforms fragmented career preparation into a continuous, personalized, closed-loop AI coaching system. It connects Resume ATS Scoring -> Skill Gap Analysis -> Targeted Prep -> Adaptive Voice/Text Mock Interviews -> Multi-Dimensional Evaluation -> Long-Term Candidate Memory -> Dynamic Next-Best-Action Recommendations.", bold_prefix="Core Value Proposition: ")

    add_heading_2(doc, "1.2 The 30-Second Elevator Pitch")
    add_callout_box(
        doc,
        "Most students prepare for placements using disconnected platforms—one tool for resume analysis, another for aptitude, LeetCode for DSA, YouTube for Core CS, and friends for mock interviews. None of these tools talk to each other.\n\nHireCraft AI brings all these into one unified system governed by an AI Orchestrator. It analyzes the candidate's resume and target job role, identifies specific skill gaps, builds a custom preparation path, conducts adaptive voice mock interviews, evaluates technical and communication performance, remembers weaknesses across sessions, and continuously recommends what the candidate should practice next. It is not just an interview chatbot; it is a complete, closed-loop AI career coach.",
        title="Elevator Pitch (For Review Panel & Technical Defense)"
    )

    add_heading_2(doc, "1.3 Scope & Purpose of Document")
    add_body_paragraph(doc, "This document defines the end-to-end System Design & Technical Architecture for HireCraft AI. It establishes concrete specifications for system goals, functional/non-functional requirements, component layering, AI multi-agent orchestration, hybrid memory persistence, technology selection, security architecture, scalability, and development roadmap.")

    # --- SECTION 2 ---
    add_heading_1(doc, "2. System Objectives")
    add_heading_2(doc, "2.1 Strategic Product Goals")
    add_bullet_item(doc, "Deliver a personalized preparation path tailored to candidate proficiency and target role requirements.", bold_prefix="1. End-to-End Personalization: ")
    add_bullet_item(doc, "Combine pre-curated subject question banks with dynamic runtime AI evaluation to prevent hallucination and reduce token overhead.", bold_prefix="2. Deterministic Quality & Token Efficiency: ")
    add_bullet_item(doc, "Achieve sub-100ms LLM processing latency for live speech interviews using fast adapters (e.g. Groq).", bold_prefix="3. Low-Latency Voice Interaction: ")
    add_bullet_item(doc, "Maintain candidate state across sessions so the system targets active weak areas without repeating mastered topics.", bold_prefix="4. Persistent Candidate Memory: ")
    add_bullet_item(doc, "Assess technical accuracy (70%) independently from speech clarity (30%) to eliminate non-native accent bias.", bold_prefix="5. Fair Multi-Dimensional Assessment: ")

    add_heading_2(doc, "2.2 Core Problem vs. HireCraft AI Solution")
    prob_data = [
        ["Preparation Tools", "Disconnected tools (Resume checkers, DSA judges, YouTube)", "Single unified platform governed by AI Orchestration"],
        ["Session Memory", "Zero memory across tools or practice sessions", "Central Candidate Memory tracking topic-level proficiency"],
        ["Interview Coaching", "Static non-adaptive mock interviews or peer dependency", "Real-time adaptive voice AI interviewer with deep follow-ups"],
        ["Evaluation Criteria", "Vague high-level scores without concept rubrics", "Rubric-based Technical Coverage (70%) + Speech Analytics (30%)"],
        ["Next Action", "Candidate must guess what to study next", "Dynamic daily 'Next Best Action' schedule targeting active gaps"]
    ]
    add_styled_table(doc, ["Dimension", "Fragmented Status Quo", "HireCraft AI Closed-Loop Solution"], prob_data, col_widths=[1.5, 2.5, 2.5])

    # --- SECTION 3 ---
    add_heading_1(doc, "3. Functional Requirements")
    add_heading_2(doc, "3.1 Candidate Profiling & Long-Term Memory (FR-1)")
    add_bullet_item(doc, "System shall capture user credentials, target job role, experience level, and education background.", bold_prefix="FR-1.1: ")
    add_bullet_item(doc, "System shall maintain a persistent Candidate Memory matrix tracking proficiency scores across Core CS topics (DBMS, CN, OOPS, OS), DSA, and Aptitude.", bold_prefix="FR-1.2: ")
    add_bullet_item(doc, "System shall update topic proficiency scores automatically after every completed practice or mock interview session.", bold_prefix="FR-1.3: ")

    add_heading_2(doc, "3.2 Resume Parsing & ATS Engine (FR-2)")
    add_bullet_item(doc, "System shall accept PDF and Word resume uploads, extracting plain text, contact details, skills, and work history.", bold_prefix="FR-2.1: ")
    add_bullet_item(doc, "System shall compute an overall ATS Score based on Skill Match (40%), Keyword Match (30%), Formatting (20%), and Impact (10%).", bold_prefix="FR-2.2: ")
    add_bullet_item(doc, "System shall extract technical skill gaps and missing keywords relative to target job descriptions.", bold_prefix="FR-2.3: ")

    add_heading_2(doc, "3.3 Curated Subject Question Bank & Practice (FR-3)")
    add_bullet_item(doc, "System shall maintain pre-curated question banks for major Core CS subjects (cn.json, dbms.json, oops.json, os.json).", bold_prefix="FR-3.1: ")
    add_bullet_item(doc, "Each question bank entry shall define difficulty level, expected concept list, and weighted evaluation rubric.", bold_prefix="FR-3.2: ")
    add_bullet_item(doc, "System shall serve difficulty-calibrated practice problems matched to candidate current level.", bold_prefix="FR-3.3: ")

    add_heading_2(doc, "3.4 Adaptive AI Voice/Text Mock Interview Engine (FR-4)")
    add_bullet_item(doc, "System shall capture live candidate speech via Web Speech API / MediaRecorder and synthesize AI responses via Audio TTS.", bold_prefix="FR-4.1: ")
    add_bullet_item(doc, "System shall dynamically adjust question difficulty based on live candidate answer accuracy.", bold_prefix="FR-4.2: ")
    add_bullet_item(doc, "System shall generate context-aware follow-up questions targeting missing rubric concepts.", bold_prefix="FR-4.3: ")

    add_heading_2(doc, "3.5 Multi-Dimensional Evaluation Engine (FR-5)")
    add_bullet_item(doc, "System shall score technical accuracy (70%) by benchmarking answers against predefined concept rubrics.", bold_prefix="FR-5.1: ")
    add_bullet_item(doc, "System shall score communication clarity (30%) measuring speaking pace (WPM), filler density, and STAR structure.", bold_prefix="FR-5.2: ")
    add_bullet_item(doc, "System shall generate structured feedback reports detailing strengths, missing concepts, and suggested model answers.", bold_prefix="FR-5.3: ")

    add_heading_2(doc, "3.6 Dynamic Recommendation Engine (FR-6)")
    add_bullet_item(doc, "System shall compute daily readiness scores comparing candidate state against target role requirements.", bold_prefix="FR-6.1: ")
    add_bullet_item(doc, "System shall formulate personalized daily preparation schedules specifying target topics, estimated time, and practice type.", bold_prefix="FR-6.2: ")

    # --- SECTION 4 ---
    add_heading_1(doc, "4. Non-Functional Requirements")
    nfr_data = [
        ["NFR Category", "Requirement Metric", "Target Specification"],
        ["Performance & Latency", "LLM Speech Turn Latency", "< 100 ms response time using Groq Llama-3-70b"],
        ["Performance & Latency", "STT & Voice Processing Delay", "< 1.5 seconds total audio round-trip delay"],
        ["Performance & Latency", "Dashboard REST API Latency", "< 200 ms response time for all analytics endpoints"],
        ["Reliability & Uptime", "System Service Availability", "99.5% operational uptime"],
        ["Fault Tolerance", "LLM Provider Failover", "Auto-failover: Groq -> Gemini 1.5 -> OpenAI on timeout"],
        ["Security & Isolation", "Authentication & Authorization", "Stateless JWT tokens + BCrypt password hashing"],
        ["Security & Isolation", "Candidate Data Isolation", "Strict per-user ID filtering across database queries"],
        ["Usability & Scale", "UI Responsiveness & Layout", "100% responsive across desktop, tablet, and mobile"]
    ]
    add_styled_table(doc, nfr_data[0], nfr_data[1:], col_widths=[2.0, 2.2, 2.3])

    # --- SECTION 5 ---
    add_heading_1(doc, "5. High-Level Architecture")
    add_body_paragraph(doc, "HireCraft AI is engineered as a Modular Monolith. Logic is organized within a single Spring Boot application divided into strictly bounded domains (Auth, Resume, Interview, Practice, Memory, Analytics). This guarantees low operational overhead and zero inter-service network latency while ensuring clean code separation.")

    arch_diagram = """+-------------------------------------------------------------------------+
|                       CLIENT TIER (React 18 + TS)                       |
|      [ Dashboard UI ]    [ Audio Voice Recorder ]    [ Practice Portal ]|
+------------------------------------v------------------------------------+
                                     | HTTPS REST / WebSockets
+------------------------------------v------------------------------------+
|                    API & SECURITY TIER (Spring Boot 3)                  |
|      [ JwtAuthFilter ]    [ AuthCtrl ]    [ InterviewCtrl ]   [ ResumeCtrl ]|
+------------------------------------v------------------------------------+
                                     | Domain Service Calls
+------------------------------------v------------------------------------+
|                    CORE INTELLIGENCE & SERVICE LAYER                    |
|  [ AI Orchestrator ] [ Candidate Memory ] [ ATS Engine ] [ Eval Engine ]|
+------------------v---------------------------------v--------------------+
                   |                                 |
+------------------v--------------+       +----------v--------------------+
|  AI INTEGRATION LAYER (Strategy)|       |       PERSISTENCE LAYER       |
|  [ Groq ]  [ Gemini ]  [ OpenAI ]|       |  [ MySQL 8.0 ]  [ Vector DB ] |
+---------------------------------+       +-------------------------------+"""
    add_code_block(doc, arch_diagram)

    # --- SECTION 6 ---
    add_heading_1(doc, "6. Component Architecture")
    add_heading_2(doc, "6.1 Layered System Breakdown")
    add_bullet_item(doc, "Built with React 18, TypeScript, and Vite. Controls audio capture via Web Speech API / MediaRecorder and presents analytics dashboards.", bold_prefix="1. Frontend Layer: ")
    add_bullet_item(doc, "Spring Boot REST Controllers secured by Spring Security 6 and stateless JWT tokens. Enforces request validation, rate limiting, and CORS.", bold_prefix="2. Backend API & Security Layer: ")
    add_bullet_item(doc, "Contains core engines including AI Orchestrator, ResumeService, InterviewEngine, EvaluationService, MemoryService, and RecommendationEngine.", bold_prefix="3. Core Intelligence Services: ")
    add_bullet_item(doc, "Abstracts LLM providers behind a unified LLMService interface using the Strategy Pattern (Groq, Gemini 1.5, OpenAI).", bold_prefix="4. AI Integration Layer: ")
    add_bullet_item(doc, "MySQL 8.0 storing relational entities (Users, Sessions, Questions) and native JSON columns (topic_proficiency, rubrics, missing_skills).", bold_prefix="5. Persistence Layer: ")

    # --- SECTION 7 ---
    add_heading_1(doc, "7. AI Architecture")
    add_heading_2(doc, "7.1 Multi-Agent Orchestration Model")
    add_body_paragraph(doc, "The system operates conceptually as seven specialized AI Agents coordinated by the Central AI Orchestrator:")
    agent_data = [
        ["Agent Name", "Primary Responsibilities", "Core Data Input / Output"],
        ["Career Memory Agent", "Tracks skill masteries, weaknesses, and history", "Candidate Memory JSON Matrix"],
        ["Resume & ATS Agent", "Parses PDFs, extracts entities, scores ATS match", "Resume PDF -> ATS Score & Gaps"],
        ["Job Analysis Agent", "Analyzes target job descriptions for required skills", "Job Description -> Skill Vector"],
        ["Preparation Agents", "Serves difficulty-calibrated practice problems", "Core CS Question Banks (cn, dbms)"],
        ["Adaptive Interview Agent", "Manages live interview state & deep follow-ups", "Live Transcript -> Adaptive Question"],
        ["Evaluation Agent", "Scores technical accuracy against rubric & speech pace", "Transcript -> 70% Tech + 30% Comm"],
        ["Recommendation Agent", "Computes readiness score and daily next best action", "Candidate State -> Daily Plan"]
    ]
    add_styled_table(doc, agent_data[0], agent_data[1:], col_widths=[1.8, 2.7, 2.0])

    add_heading_2(doc, "7.2 Strategy Pattern for LLM Provider Independence")
    code_snippet = """public interface LLMService {
    String generateResponse(String systemPrompt, String userPrompt);
    EvaluationResult evaluateAnswer(String question, String answer, List<String> expectedConcepts);
}"""
    add_code_block(doc, code_snippet)
    add_bullet_item(doc, "Sub-100ms response time using Llama-3 70B, ideal for real-time speech interviews.", bold_prefix="Groq LLM Adapter: ")
    add_bullet_item(doc, "High reasoning capacity and multi-modal document processing for resume ATS scoring.", bold_prefix="Gemini 1.5 Adapter: ")
    add_bullet_item(doc, "Redundant fallback provider to handle rate limits or primary API downtime.", bold_prefix="OpenAI Adapter: ")

    add_heading_2(doc, "7.3 Hybrid Dual-Layer Memory Model")
    add_bullet_item(doc, "Stores exact quantitative metrics (topic scores, attempt counts, pass/fail thresholds) in native MySQL JSON columns.", bold_prefix="Structured Memory (RDBMS): ")
    add_bullet_item(doc, "Stores verbatim candidate transcripts and past interview feedback as vector embeddings. During interviews, vector search checks whether the candidate is repeating past conceptual mistakes.", bold_prefix="Semantic Memory (Vector RAG): ")

    # --- SECTION 8 ---
    add_heading_1(doc, "8. Data Flow")
    add_heading_2(doc, "8.1 Master End-to-End Candidate Journey")
    seq_flow = """Candidate            React UI            API Gateway          Orchestrator         Question Bank        Eval Engine          Candidate Memory
    |                   |                     |                     |                    |                   |                      |
    |--1. Upload Resume->|                     |                     |                    |                   |                      |
    |                   |--2. POST /resume--->|                     |                    |                   |                      |
    |                   |                     |--3. Extract Skill-->|                    |                   |                      |
    |                   |<-4. ATS Score & Gap-|                     |                    |                   |                      |
    |                   |                     |                     |                    |                   |                      |
    |--5. Start Interview-------------------->|                     |                    |                   |                      |
    |                   |                     |--6. Init Session--->|                    |                   |                      |
    |                   |                     |                     |--7. Fetch State--->|                   |                      |
    |                   |                     |                     |<-8. Weak: DBMS-----|                   |                      |
    |                   |                     |                     |--9. Get Q (DBMS)-->|                   |                      |
    |                   |<-10. AI Audio Q-----|                     |<-11. Question -----+                   |                      |
    |                   |                     |                     |                    |                   |                      |
    |--12. Speak Answer>|                     |                     |                    |                   |                      |
    |                   |--13. Stream Audio-->|                     |                    |                   |                      |
    |                   |                     |--14. Evaluate Answer-------------------->|                   |                      |
    |                   |                     |                     |                    |<-15. Score 85%----+                      |
    |                   |                     |                     |--16. Update Memory--------------------------------------------->|
    |                   |<-17. Session Report ----------------------+------------------------------------------------------------------+"""
    add_code_block(doc, seq_flow)

    # --- SECTION 9 ---
    add_heading_1(doc, "9. Module Architecture")
    add_heading_2(doc, "9.1 Module 2: ATS Scoring Formula")
    add_body_paragraph(doc, "The Resume Engine evaluates uploaded documents using the weighted ATS formula:")
    add_callout_box(
        doc,
        "ATS Score = (0.40 * Skill Match) + (0.30 * Keyword Match) + (0.20 * Structure Score) + (0.10 * Impact Quantification Score)",
        title="ATS Scoring Formula"
    )

    add_heading_2(doc, "9.2 Module 3: Question Bank Entry Schema")
    json_schema = """{
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
}"""
    add_code_block(doc, json_schema)

    add_heading_2(doc, "9.3 Module 5: Evaluation Scorecard Breakdown")
    eval_data = [
        ["Technical Dimension (70% Weight)", "Communication Dimension (30% Weight)"],
        ["• Concept Coverage (% of expected rubric)", "• Speaking Pace (Words Per Minute)"],
        ["• Technical Precision & Accuracy", "• Structural Clarity (STAR / Direct Method)"],
        ["• Keyword & Terminology Presence", "• Filler Word Density ('um', 'ah', 'like')"],
        ["• Edge Case & Exception Awareness", "• Response Conciseness vs. Verbosity"]
    ]
    add_styled_table(doc, eval_data[0], eval_data[1:], col_widths=[3.25, 3.25])

    # --- SECTION 10 ---
    add_heading_1(doc, "10. Technology Stack")
    add_heading_2(doc, "10.1 Technical Stack Matrix")
    tech_data = [
        ["Component", "Technology", "Version", "Rationale"],
        ["Frontend UI", "React 18, TypeScript, Vite", "18.x / 5.x", "Modular component UI, static typing, fast HMR build"],
        ["Audio Capture", "Web Speech API / MediaRecorder", "Native", "Low-latency in-browser audio capture without plugins"],
        ["Backend App", "Java 21, Spring Boot 3", "3.2.x", "Enterprise reliability, high concurrency, clean architecture"],
        ["Security", "Spring Security 6, JWT, BCrypt", "6.x", "Stateless API authentication & password encryption"],
        ["Database", "MySQL 8.0", "8.0", "Relational integrity for core entities + native JSON support"],
        ["AI LLM APIs", "Groq, Gemini 1.5, OpenAI", "API", "Multi-provider strategy with sub-100ms latency via Groq"]
    ]
    add_styled_table(doc, tech_data[0], tech_data[1:], col_widths=[1.3, 1.8, 0.9, 2.5])

    add_heading_2(doc, "10.2 Backend Package Structure")
    pkg_str = """com.hirecraft.voiceinterview/
├── config/             # Spring Security, CORS, Redis config
├── controller/         # Auth, Resume, Interview, Question, Analytics REST APIs
├── dto/                # Request and Response payload objects
├── entity/             # User, UserProfile, Question, InterviewSession JPA entities
├── repository/         # Spring Data JPA repositories
├── security/           # JwtService, JwtAuthFilter implementation
└── service/            # AuthService, ResumeService, InterviewService, EvalService, MemoryService"""
    add_code_block(doc, pkg_str)

    # --- SECTION 11 ---
    add_heading_1(doc, "11. Security Architecture")
    add_bullet_item(doc, "Stateless token-based authentication. User authentication issues a signed JWT containing user ID and system roles.", bold_prefix="Stateless JWT Security: ")
    add_bullet_item(doc, "BCrypt algorithm with cost factor 12 used for all candidate password hashing.", bold_prefix="Password Encryption: ")
    add_bullet_item(doc, "All database queries enforce user_id scoping to prevent cross-candidate data leakage.", bold_prefix="Data Isolation: ")

    # --- SECTION 12 ---
    add_heading_1(doc, "12. Scalability Considerations")
    add_bullet_item(doc, "Spring Boot backend maintains zero in-memory session state, allowing seamless horizontal scaling behind NGINX load balancing.", bold_prefix="Stateless Application Layer: ")
    add_bullet_item(doc, "Composite indexes on (user_id, created_at) and functional indexes on native JSON proficiency keys.", bold_prefix="Database Optimization: ")
    add_bullet_item(doc, "Automatic LLM provider switching (Groq -> Gemini -> OpenAI) prevents service interruption during rate-limiting events.", bold_prefix="AI Rate-Limit Resilience: ")

    # --- SECTION 13 ---
    add_heading_1(doc, "13. Current Development Status")
    status_diagram = """+--------------------------------------------------------------------------+
| PHASE 1: MVP CORE ARCHITECTURE (COMPLETED / REVIEW 2 DELIVERABLE)         |
|  [x] Master System Design & Database Specification                       |
|  [x] Curated Core CS Question Banks (CN, DBMS, OOPS, OS JSON Banks)      |
|  [x] Spring Boot 3 API Layer & JWT Security Configuration                |
|  [x] React + TypeScript + Vite Frontend Foundation                       |
+--------------------------------------------------------------------------+
| PHASE 2: ADAPTIVE ENGINE & MEMORY PERSISTENCE (IN PROGRESS)              |
|  [ ] Resume Parser & ATS Scoring Integration                             |
|  [ ] Dual-Layer Candidate Memory Persistence                             |
|  [ ] Adaptive Follow-up Logic & Dynamic Recommendation Engine            |
+--------------------------------------------------------------------------+
| PHASE 3: ADVANCED VOICE & ANALYTICS (FINAL MILESTONE)                    |
|  [ ] Real-Time Speech Synthesis & WebRTC Voice Interface                 |
|  [ ] Communication Analytics (Pace, Filler word counter)                 |
|  [ ] Comprehensive Placement Readiness Dashboard                         |
+--------------------------------------------------------------------------+"""
    add_code_block(doc, status_diagram)

    # Output file path
    output_path = os.path.join(os.path.dirname(__file__), "HireCraft_AI_Document_1_System_Design_and_Architecture.docx")
    doc.save(output_path)
    print(f"Successfully generated Word Document at:\n{output_path}")
    return output_path

if __name__ == "__main__":
    build_document()
