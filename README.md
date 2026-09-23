# SkillPath AI: An Adaptive Skill Learning and Interview Readiness Platform

> **Major Project — B.Tech Computer Science & Engineering (2026)**  
> **Team Members:** Sonali Upadhyay, Krishna Choudhary, Kunal Singh Khati, Aditya Kapruwan

---

## 📌 Executive Summary
**SkillPath AI** solves the core challenge of **fragmented preparation** for computer science students and placement aspirants. Rather than using isolated roadmaps, generic doubt bots, disconnected revision sheets, and static interview question sets, SkillPath AI unites preparation within a **closed-loop feedback system** driven by a centralized **Learner State** digital twin.

```
Learner Profile ──► Personalized Roadmap ──► Learning + Doubt Solving (RAG)
                                                         │
Roadmap Refinement ◄── Performance Analysis ◄── Adaptive Interview
```

---

## 🚀 Core Modules
1. **Module 1: Personalized Roadmap Generation**
   - Synthesizes prerequisite-aware curriculum graphs with difficulty ratings (1–5) and estimated time commitments.
   - Enforces strict Zod schema validation over LLM outputs with resilient fallback.
2. **Module 2: RAG-Based Doubt Solving**
   - Semantic retrieval using dense vector embeddings (`all-MiniLM-L6-v2`) and chunked technical references.
   - Grounded explanations with source transparency to prevent hallucinations.
3. **Module 3: Personalized Revision Engine**
   - Mines learner doubt frequency and assessment errors to synthesize weakness-conditioned practice problems.
4. **Module 4: Adaptive AI Interview Engine**
   - Multi-turn conversational technical mock interviews evaluating Correctness, Understanding, Depth, Communication, and Confidence.
   - Dynamically scales difficulty ($D \pm 1$) based on rubric scores.

---

## 🛠️ Technology Stack
* **Frontend:** React 19, Tailwind CSS, React Router v7, Lucide Icons, Axios, Vite
* **Backend:** Node.js, Express.js (Modular Monolith architecture)
* **Database:** MongoDB with Mongoose ODM
* **AI & LLM:** Google Gemini 1.5 Flash / Groq LLaMA 3.3 / Offline Resilient Mock Engine
* **Validation:** Zod schemas

---

## 📂 Project Structure
```
MAJOR_PROJECT/
├── client/                 # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, RoadmapCard)
│   │   ├── pages/          # Dashboard, SkillSetup, RoadmapView, DoubtSolver, etc.
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx         # Routing configuration
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express.js Backend
│   ├── src/
│   │   ├── config/         # Database and environment configurations
│   │   ├── controllers/    # Thin HTTP route handlers
│   │   ├── middleware/     # Zod validation & global error handlers
│   │   ├── models/         # Mongoose models (User, Roadmap, LearnerState, Doubt, Interview)
│   │   ├── routes/         # REST API routes (/api/roadmaps, /api/health)
│   │   ├── services/       # RoadmapService, LLMProvider, RAGService stubs
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server listener
│   ├── test/               # Node test suite for schema & service validation
│   ├── .env.example        # Environment variable template
│   └── package.json
├── .gitignore
├── package.json            # Monorepo convenience scripts
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/skillpath_ai`) or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env    # Configure your PORT and MONGODB_URI
npm run dev             # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev             # Starts client on http://localhost:5173
```

### 4. Running Automated Tests
```bash
cd server
npm test
```

---

## 👥 Contributors
* **Sonali Upadhyay**
* **Krishna Choudhary**
* **Kunal Singh Khati**
* **Aditya Kapruwan**
