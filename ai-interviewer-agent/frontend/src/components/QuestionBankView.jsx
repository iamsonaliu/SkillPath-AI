import { useEffect, useState } from "react";
import { Database, Plus, Loader2 } from "lucide-react";
import { api } from "../api";

export default function QuestionBankView() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [text, setText] = useState("");
  const [roleType, setRoleType] = useState("");
  const [competency, setCompetency] = useState("");
  const [difficulty, setDifficulty] = useState("mid");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getQuestionBank();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!text.trim() || !roleType.trim() || !competency.trim()) {
      setError("Question text, role, and competency are required.");
      return;
    }
    setSaving(true);
    try {
      await api.addQuestion({ text, roleType, competency, difficulty });
      setText("");
      setCompetency("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const roles = Array.from(new Set(questions.map((q) => q.role_type)));
  const filtered = roleFilter
    ? questions.filter((q) => q.role_type === roleFilter)
    : questions;

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Plus size={18} />
            Add Question to RAG Bank
          </h2>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleAdd}>
          <div className="field">
            <label>Role Type</label>
            <input
              className="input"
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              placeholder="e.g. Frontend Engineer, AI Engineer, TPM"
            />
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label>Competency</label>
              <input
                className="input"
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
                placeholder="e.g. system_design"
              />
            </div>

            <div className="field">
              <label>Difficulty</label>
              <select
                className="select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Seed Question Prompt</label>
            <textarea
              className="textarea"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a high-signal interview seed question..."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 size={15} className="spin" /> : <Plus size={15} />}
            {saving ? "Indexing into ChromaDB..." : "Add & Index Question"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="row-between" style={{ marginBottom: 14 }}>
          <h2 className="card-title">
            <Database size={18} />
            Indexed Seed Questions ({filtered.length})
          </h2>
          <select
            className="select"
            style={{ width: "auto" }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="row-gap muted">
            <Loader2 size={16} className="spin" /> Loading question bank...
          </div>
        ) : (
          <div style={{ maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
            {filtered.map((q) => (
              <div key={q.id} className="coach-section" style={{ marginTop: 10 }}>
                <div className="row-gap" style={{ marginBottom: 6 }}>
                  <span className="chip">{q.role_type}</span>
                  <span className="chip neutral">{q.competency}</span>
                  <span className="chip warning">{q.difficulty}</span>
                </div>
                <p>{q.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

