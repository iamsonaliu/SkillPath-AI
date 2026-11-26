import { Fragment, useEffect, useState } from "react";
import { BarChart3, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { api } from "../api";

export default function HistoryView() {
  const [answers, setAnswers] = useState([]);
  const [stats, setStats] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  async function load(filter = roleFilter) {
    setLoading(true);
    setError("");
    try {
      const data = await api.getHistory(filter);
      setAnswers(data.answers || []);
      setStats(data.competency_stats || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
  }, []);

  async function handleDelete(id) {
    try {
      await api.deleteHistoryItem(id);
      await load(roleFilter);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleClearAll() {
    if (!window.confirm("Clear all persisted interview history from SQLite?")) return;
    try {
      await api.clearHistory();
      await load("");
    } catch (err) {
      setError(err.message);
    }
  }

  const uniqueRoles = Array.from(new Set(answers.map((a) => a.role_type).filter(Boolean)));

  return (
    <div>
      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <div className="row-between" style={{ marginBottom: 14 }}>
          <h2 className="card-title">
            <BarChart3 size={18} />
            Adaptive Competency Performance
          </h2>
          <div className="row-gap">
            <select
              className="select"
              style={{ width: "auto" }}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                load(e.target.value);
              }}
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => load(roleFilter)}>
              <RefreshCw size={14} /> Refresh
            </button>
            {answers.length > 0 && (
              <button type="button" className="btn btn-danger btn-sm" onClick={handleClearAll}>
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="row-gap muted">
            <Loader2 size={16} className="spin" /> Loading persisted analytics...
          </div>
        ) : stats.length === 0 ? (
          <p className="muted">
            No completed interview answers yet. Complete an interview session to see real competency trends and adaptive targeting.
          </p>
        ) : (
          <div className="score-grid">
            {stats.map((s) => (
              <div key={s.competency} className="score-tile">
                <div className="score-tile-top">
                  <span className="score-label">{s.competency}</span>
                  <span className="score-val">{s.avg_overall}</span>
                </div>
                <div className="score-bar" style={{ marginBottom: 8 }}>
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${Math.min(100, (s.avg_overall || 0) * 10)}%`,
                      background: s.avg_overall >= 7 ? "#10b981" : s.avg_overall >= 5 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <div className="muted" style={{ fontSize: 11 }}>
                  {s.attempts} attempt{s.attempts === 1 ? "" : "s"} · Str {s.avg_structure} · Spec{" "}
                  {s.avg_specificity} · Tech {s.avg_technical_accuracy} · Comm {s.avg_communication}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 12 }}>
          Answer Log ({answers.length})
        </h3>
        {answers.length === 0 ? (
          <p className="muted">No saved answers found in SQLite.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Role</th>
                  <th>Competency</th>
                  <th>Question</th>
                  <th>Avg</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {answers.map((row) => {
                  const avg = (
                    (row.structure +
                      row.specificity +
                      row.technical_accuracy +
                      row.communication) /
                    4
                  ).toFixed(1);
                  const isOpen = expandedId === row.id;
                  return (
                    <Fragment key={row.id}>
                      <tr
                        style={{ cursor: "pointer" }}
                        onClick={() => setExpandedId(isOpen ? null : row.id)}
                      >
                        <td className="muted">{(row.created_at || "").slice(0, 16).replace("T", " ")}</td>
                        <td>{row.role_type}</td>
                        <td>
                          <span className="chip neutral">{row.competency}</span>
                        </td>
                        <td>{row.question}</td>
                        <td>
                          <strong>{avg}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label="Delete entry"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(row.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={`${row.id}-detail`}>
                          <td colSpan={6} style={{ background: "var(--bg-elevated)" }}>
                            <div style={{ padding: "6px 4px", fontSize: 13 }}>
                              <p style={{ margin: "0 0 8px" }}>
                                <strong>Scores:</strong> Structure {row.structure}, Specificity{" "}
                                {row.specificity}, Technical {row.technical_accuracy}, Communication{" "}
                                {row.communication}
                              </p>
                              {row.answer && (
                                <p style={{ margin: "0 0 8px" }}>
                                  <strong>Your Answer:</strong> {row.answer}
                                </p>
                              )}
                              {row.rationale && (
                                <p style={{ margin: "0 0 8px" }}>
                                  <strong>Rationale:</strong> {row.rationale}
                                </p>
                              )}
                              {row.feedback && (
                                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                                  <strong>Coach Feedback:</strong> {row.feedback}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
