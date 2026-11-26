import { useEffect, useState } from "react";
import { Bot, Sparkles, BarChart3, Database } from "lucide-react";
import { api } from "./api";
import SetupView from "./components/SetupView";
import InterviewView from "./components/InterviewView";
import DebriefView from "./components/DebriefView";
import HistoryView from "./components/HistoryView";
import QuestionBankView from "./components/QuestionBankView";

export default function App() {
  const [tab, setTab] = useState("interview"); // interview | history | bank
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(false);

  const [activeSession, setActiveSession] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);

  useEffect(() => {
    api
      .health()
      .then((res) => {
        setHealth(res);
        setHealthError(false);
      })
      .catch(() => {
        setHealthError(true);
      });
  }, []);

  function handleSessionStarted(sessionData) {
    setSessionSummary(null);
    setActiveSession(sessionData);
    setTab("interview");
  }

  function handleSessionComplete(summary) {
    setActiveSession(null);
    setSessionSummary(summary);
  }

  function handleRestart() {
    setActiveSession(null);
    setSessionSummary(null);
    setTab("interview");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Bot size={22} />
          </div>
          <div>
            <h1>AI Interview Coach</h1>
            <p>Multi-Agent Adaptive Interviewer · Evaluator · Coach</p>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Primary Navigation">
          <button
            type="button"
            className={`nav-tab ${tab === "interview" ? "active" : ""}`}
            onClick={() => setTab("interview")}
          >
            <Sparkles size={15} />
            Interview Studio
          </button>
          <button
            type="button"
            className={`nav-tab ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            <BarChart3 size={15} />
            Analytics &amp; History
          </button>
          <button
            type="button"
            className={`nav-tab ${tab === "bank" ? "active" : ""}`}
            onClick={() => setTab("bank")}
          >
            <Database size={15} />
            RAG Question Bank
          </button>
        </nav>

        <div className="status-pill" title={health ? `Model: ${health.model}` : "Backend status"}>
          <span className={`status-dot ${healthError ? "offline" : ""}`} />
          <span>
            {healthError
              ? "Backend Offline"
              : health
              ? `${health.model}`
              : "Connecting..."}
          </span>
        </div>
      </header>

      {tab === "interview" && (
        <>
          {!activeSession && !sessionSummary && (
            <SetupView onSessionStarted={handleSessionStarted} />
          )}
          {activeSession && !sessionSummary && (
            <InterviewView
              initialSession={activeSession}
              onComplete={handleSessionComplete}
            />
          )}
          {sessionSummary && (
            <DebriefView
              summary={sessionSummary}
              onRestart={handleRestart}
              onViewHistory={() => setTab("history")}
            />
          )}
        </>
      )}

      {tab === "history" && <HistoryView />}
      {tab === "bank" && <QuestionBankView />}
    </div>
  );
}

