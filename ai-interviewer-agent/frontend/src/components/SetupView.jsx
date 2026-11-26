import { useState } from "react";
import {
  Sparkles,
  FileText,
  Upload,
  Plus,
  X,
  Play,
  Loader2,
  Volume2,
  Sliders,
} from "lucide-react";
import { api } from "../api";

export default function SetupView({ onSessionStarted }) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const [roleType, setRoleType] = useState("");
  const [seniority, setSeniority] = useState("mid");
  const [competencies, setCompetencies] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [keySkills, setKeySkills] = useState([]);
  const [summary, setSummary] = useState("");

  const [newComp, setNewComp] = useState("");
  const [newFocus, setNewFocus] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [voice, setVoice] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");
    if (!resumeText.trim() && !jobDescription.trim() && !resumeFile) {
      setError("Paste a job description, paste your resume, or upload a resume file to analyze.");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await api.parseProfile({
        resumeText,
        jobDescription,
        resumeFile,
      });
      setRoleType(res.role_type || "");
      setSeniority(res.seniority || "mid");
      setCompetencies(res.competencies || []);
      setFocusAreas(res.focus_areas || []);
      setKeySkills(res.key_skills || []);
      setSummary(res.summary || "");
      if (res.extracted_resume_text && !resumeText.trim()) {
        setResumeText(res.extracted_resume_text);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  function addCompetency() {
    const cleaned = newComp.trim().toLowerCase().replace(/\s+/g, "_");
    if (cleaned && !competencies.includes(cleaned)) {
      setCompetencies([...competencies, cleaned]);
    }
    setNewComp("");
  }

  function addFocusArea() {
    const cleaned = newFocus.trim();
    if (cleaned && !focusAreas.includes(cleaned)) {
      setFocusAreas([...focusAreas, cleaned]);
    }
    setNewFocus("");
  }

  async function handleStart(e) {
    e.preventDefault();
    setError("");
    if (!roleType.trim()) {
      setError("Enter a target role (or click 'Analyze Resume & JD' to detect one automatically).");
      return;
    }
    setStarting(true);
    try {
      const sessionData = await api.startSession({
        roleType: roleType.trim(),
        seniority,
        competencies,
        numQuestions,
        voice,
        resumeText,
        jobDescription,
        focusAreas,
      });
      onSessionStarted(sessionData);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  return (
    <form onSubmit={handleStart}>
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <FileText size={18} />
              1. Target Role &amp; Candidate Context
            </h2>
          </div>

          <div className="field">
            <label htmlFor="jd-input">Job Description / Role Summary</label>
            <textarea
              id="jd-input"
              className="textarea"
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description, requirements, or interview focus..."
            />
          </div>

          <div className="field">
            <label htmlFor="resume-file">Resume (Upload PDF/TXT or paste below)</label>
            <div className="upload-zone">
              <span>{resumeFile ? resumeFile.name : "Optional: Attach .pdf, .txt, or .md resume"}</span>
              <label className="btn btn-secondary btn-sm" style={{ margin: 0 }}>
                <Upload size={14} />
                {resumeFile ? "Change file" : "Upload file"}
                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.txt,.md"
                  hidden
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <textarea
              className="textarea"
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume highlights, projects, and experience..."
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            {analyzing ? "Analyzing with AI..." : "Analyze Resume & JD"}
          </button>

          {summary && (
            <div className="coach-section" style={{ marginTop: 14 }}>
              <h4>AI Fit Assessment</h4>
              <p>{summary}</p>
              {keySkills.length > 0 && (
                <div className="chips" style={{ marginTop: 10 }}>
                  {keySkills.map((skill) => (
                    <span key={skill} className="chip neutral">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Sliders size={18} />
              2. Interview Configuration
            </h2>
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label htmlFor="role-input">Target Role *</label>
              <input
                id="role-input"
                className="input"
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                placeholder="e.g. Senior React Engineer, AI Engineer, TPM"
              />
            </div>

            <div className="field">
              <label htmlFor="seniority-select">Seniority Level</label>
              <select
                id="seniority-select"
                className="select"
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
              >
                <option value="entry">Entry / Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
                <option value="staff">Staff / Principal</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Competencies to Probe (adaptive weighting uses past scores)</label>
            <div className="chips">
              {competencies.length === 0 && (
                <span className="muted">
                  Run AI analysis or add custom competencies (e.g. system_design, leadership).
                </span>
              )}
              {competencies.map((comp) => (
                <span key={comp} className="chip">
                  {comp}
                  <button
                    type="button"
                    aria-label={`Remove ${comp}`}
                    onClick={() => setCompetencies(competencies.filter((c) => c !== comp))}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="inline-add">
              <input
                className="input"
                value={newComp}
                onChange={(e) => setNewComp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCompetency();
                  }
                }}
                placeholder="Add competency (e.g. react_architecture)"
              />
              <button type="button" className="btn btn-secondary" onClick={addCompetency}>
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="field">
            <label>Resume / JD Focus Areas (optional)</label>
            <div className="chips">
              {focusAreas.map((area) => (
                <span key={area} className="chip warning">
                  {area}
                  <button
                    type="button"
                    aria-label={`Remove ${area}`}
                    onClick={() => setFocusAreas(focusAreas.filter((f) => f !== area))}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="inline-add">
              <input
                className="input"
                value={newFocus}
                onChange={(e) => setNewFocus(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFocusArea();
                  }
                }}
                placeholder="Add topic to probe (e.g. state management scaling)"
              />
              <button type="button" className="btn btn-secondary" onClick={addFocusArea}>
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 12, marginTop: 12 }}>
            <div className="field">
              <label htmlFor="num-questions">Number of Questions (1–15)</label>
              <input
                id="num-questions"
                className="input"
                type="number"
                min={1}
                max={15}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              />
            </div>

            <div className="field" style={{ display: "flex", alignItems: "flex-end", paddingBottom: 10 }}>
              <label className="toggle-row" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={voice}
                  onChange={(e) => setVoice(e.target.checked)}
                />
                <Volume2 size={16} />
                <span>Voice Mode (TTS + Mic STT)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8, padding: "13px 18px" }}
            disabled={starting}
          >
            {starting ? <Loader2 size={17} className="spin" /> : <Play size={17} />}
            {starting ? "Preparing First Question..." : "Start Live Interview"}
          </button>
        </div>
      </div>
    </form>
  );
}

