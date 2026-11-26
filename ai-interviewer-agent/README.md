# AI Interviewer Agent

Upload a resume and job description to get a tailored mock interview, rubric-scored answers, live coaching, and cross-session memory that targets your weakest competencies first.

---

## Features

| Feature | Description |
|---|---|
| Profile Analysis | Parses `.pdf` / `.txt` / `.md` resume and pasted JD. Infers role, seniority (`entry` / `mid` / `senior` / `staff`), competencies, key skills, focus areas |
| Hybrid RAG Questions | Retrieves seed questions from ChromaDB (local `all-MiniLM-L6-v2`, $0 embedding cost) or generates fresh ones from resume + JD |
| Live Follow-Ups | Probes gaps or claims in your last answer |
| Rubric Scoring | 1-10 on `structure`, `specificity`, `technical_accuracy`, `communication`, plus strengths, gaps, two tips, and a rewritten answer |
| Adaptive Memory | SQLite tracks per-competency averages; the weakest competency is drilled first in the next session |
| Debrief | Overall verdict, strengths, priority improvements, next drill plan |
| Voice Mode | Speak answers (Groq Whisper), hear questions and coaching (`edge-tts`) |

---

## High-Level Design (HLD)

### System Architecture

```mermaid
flowchart TB
    subgraph Client["Client"]
        UI["React 19 + Vite UI"]
    end

    subgraph Backend["FastAPI Backend"]
        API["REST API<br/>src/api.py"]
        ORCH["InterviewSession Orchestrator<br/>(deterministic state machine)"]
        subgraph Agents["Agents (src/agents)"]
            RP["ResumeParser"]
            IV["Interviewer"]
            EV["Evaluator"]
            CO["Coach"]
        end
        LLM["Resilient Groq Client<br/>JSON mode + model fallback"]
        VOICE["Voice<br/>STT / TTS"]
    end

    subgraph Data["Data Layer"]
        CHROMA[("ChromaDB<br/>question_bank.json")]
        SQL[("SQLite<br/>memory.sqlite3")]
    end

    GROQ(("Groq API"))

    UI <--> API
    API --> ORCH
    API --> VOICE
    ORCH --> RP & IV & EV & CO
    RP & IV & EV & CO --> LLM
    IV <--> CHROMA
    ORCH <--> SQL
    LLM --> GROQ
    VOICE --> GROQ
```

### Interview Lifecycle

```mermaid
stateDiagram-v2
    [*] --> ParseProfile: resume + JD
    ParseProfile --> PickCompetency: role, seniority, competencies

    PickCompetency --> AskQuestion: weakest competency first
    AskQuestion --> AwaitAnswer
    AwaitAnswer --> Evaluate: text or audio
    Evaluate --> Coach: rubric scores
    Coach --> Decision

    Decision --> FollowUp: /followup
    FollowUp --> AwaitAnswer
    Decision --> PickCompetency: /next
    Decision --> Debrief: no questions left or /finish

    Debrief --> [*]
```

---

## Low-Level Design (LLD)

### Answer Turn (Sequence)

```mermaid
sequenceDiagram
    actor U as User
    participant F as React UI
    participant A as FastAPI
    participant O as Orchestrator
    participant E as Evaluator
    participant C as Coach
    participant D as SQLite

    U->>F: Type or speak answer
    F->>A: POST /session/{id}/answer
    opt Audio input
        A->>A: Whisper STT to transcript
    end
    A->>O: submit answer
    O->>E: score against rubric
    E-->>O: 4 scores + rationale
    O->>C: coach(answer, scores)
    C-->>O: strengths, gaps, tips, rewrite
    O->>D: persist answer + scores
    O-->>A: result
    A-->>F: transcript, scores, coaching
    F-->>U: Feedback (+ optional TTS)
```

### Hybrid Question Generation

```mermaid
flowchart LR
    A["Target competency<br/>+ resume/JD context"] --> B["Embed query<br/>all-MiniLM-L6-v2"]
    B --> C[("ChromaDB<br/>tagged seed questions")]
    C --> D{"Good match?"}
    D -- Yes --> E["Adapt seed question<br/>to candidate background"]
    D -- No --> F["Generate fresh question<br/>from resume + JD"]
    E --> G["Ask question"]
    F --> G
```

### LLM Client Fallback

```mermaid
flowchart LR
    R["Agent request<br/>(JSON mode)"] --> M1["openai/gpt-oss-120b"]
    M1 -- fail --> M2["qwen/qwen3.8-27b"]
    M2 -- fail --> M3["openai/gpt-oss-20b"]
    M1 -- ok --> P["Fence-tolerant<br/>JSON parse"]
    M2 -- ok --> P
    M3 -- ok --> P
    M3 -- fail --> X["Raise error"]
```

### Adaptive Memory

```mermaid
flowchart LR
    S1["Session N<br/>answers + scores"] --> DB[("SQLite")]
    DB --> AVG["Per-competency<br/>averages"]
    AVG --> RANK["Rank lowest to highest"]
    RANK --> NEXT["Session N+1:<br/>weakest first,<br/>then rotate the rest"]
    NEXT --> S1
```

### Data Model

```mermaid
erDiagram
    SESSIONS ||--o{ ANSWERS : contains
    SESSIONS {
        string session_id
        string role_type
        string seniority
    }
    ANSWERS {
        int answer_id
        string competency
        string question
        string answer_text
        int structure
        int specificity
        int technical_accuracy
        int communication
    }
```

### Module Layout

```
.
├── main.py                    # Entry point
├── src/
│   ├── api.py                 # FastAPI routes + static serving
│   ├── orchestrator.py        # InterviewSession state machine
│   ├── agents/                # Parser, Interviewer, Evaluator, Coach
│   │   └── utils.py           # Resilient Groq client
│   ├── rag/question_store.py  # ChromaDB store
│   ├── memory/db.py           # SQLite + analytics
│   └── voice/                 # stt.py, tts.py
├── data/question_bank.json    # Seed questions
├── frontend/                  # React + Vite (build -> frontend/dist)
└── static/audio/              # Generated TTS files
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Groq: `openai/gpt-oss-120b`, fallback `qwen/qwen3.8-27b`, `openai/gpt-oss-20b` |
| Retrieval | ChromaDB + local `all-MiniLM-L6-v2` embeddings |
| Memory | SQLite (`memory.sqlite3`) |
| Voice | Groq `whisper-large-v3-turbo` (STT), `edge-tts` `en-US-GuyNeural` (TTS) |
| Backend | FastAPI, Uvicorn, `pypdf` |
| Frontend | React 19, Vite, `lucide-react` |

---

## Setup

**1. Backend**

```bash
python -m venv venv
source venv/bin/activate        # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Windows: copy .env.example .env
# Add your key from https://console.groq.com/keys to .env
```

**2. Frontend**

```bash
cd frontend && npm install && npm run build && cd ..
```

**3. Run**

```bash
python main.py
```

Open http://127.0.0.1:8000.

For hot reload, run `npm run dev` in `frontend/` (Vite on `:5173`, proxies `/api/*` to `:8000`).

---

## API Reference

| Method | Endpoint | Purpose |
|:--|:--|:--|
| `GET` | `/api/health` | Server status + configured models |
| `POST` | `/api/parse-profile` | Parse resume (`.pdf`/`.txt`/`.md`) + JD into role and competencies |
| `POST` | `/api/session/start` | Create session, return first question |
| `GET` | `/api/session/{id}` | Fetch active session state |
| `POST` | `/api/session/{id}/answer` | Submit text/audio; returns transcript, scores, coaching |
| `POST` | `/api/session/{id}/next` | Next adaptive question, or debrief if done |
| `POST` | `/api/session/{id}/followup` | Targeted follow-up probe |
| `POST` | `/api/session/{id}/finish` | End early and generate debrief |
| `GET` | `/api/history` | Persisted answers + competency stats |
| `DELETE` | `/api/history/{answer_id}` , `/api/history` | Delete one / clear all |
| `GET` `POST` | `/api/question-bank` | List or add and index a seed question |

---

## Known Limitations

| Limitation | Impact |
|---|---|
| Active sessions held in in-memory `SESSIONS` dict | Server restart clears in-progress sessions (completed answers persist) |
| TTS `.mp3` files in `static/audio/` are not pruned | Disk usage grows over time |
| Lowest-historical-average targeting heuristic | No adaptive-difficulty / IRT model |
| Single-user, local, no auth | No multi-tenant isolation |

For a deeper breakdown, see [ARCHITECTURE_REPORT.md](ARCHITECTURE_REPORT.md).
