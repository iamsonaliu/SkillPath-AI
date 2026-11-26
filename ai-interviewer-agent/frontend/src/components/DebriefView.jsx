import { Award, RotateCcw, BarChart3, CheckCircle2, Target } from "lucide-react";

export default function DebriefView({ summary, onRestart, onViewHistory }) {
  const debrief = summary?.debrief;
  const items = summary?.qa_history || [];

  const avgAcrossSession = items.length
    ? (
        items.reduce((acc, item) => {
          const s = item.scores;
          return acc + (s.structure + s.specificity + s.technical_accuracy + s.communication) / 4;
        }, 0) / items.length
      ).toFixed(1)
    : "—";

  return (
    <div>
      <div className="card">
        <div className="row-between" style={{ marginBottom: 16 }}>
          <div>
            <div className="row-gap" style={{ marginBottom: 8 }}>
              <span className="chip">{summary.role_type}</span>
              <span className="chip neutral">{summary.seniority}</span>
              {debrief?.overall_verdict && (
                <span className="chip success">{debrief.overall_verdict}</span>
              )}
            </div>
            <h2 className="card-title" style={{ fontSize: 22 }}>
              <Award size={22} color="#10b981" />
              Session Debrief
            </h2>
          </div>

          <div style={{ textAlign: "right" }}>
            <div className="muted">Session Average</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#10b981" }}>
              {avgAcrossSession} <span style={{ fontSize: 15, color: "#9aa7c7" }}>/ 10</span>
            </div>
          </div>
        </div>

        {debrief?.summary && (
          <div className="coach-section" style={{ marginTop: 0 }}>
            <h4>Executive Summary</h4>
            <p>{debrief.summary}</p>
          </div>
        )}

        {debrief && (
          <div className="grid-2" style={{ marginTop: 14, gap: 14 }}>
            <div className="coach-section" style={{ marginTop: 0 }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: 6, color: "#6ee7b7" }}>
                <CheckCircle2 size={14} /> Top Strengths
              </h4>
              <ul>
                {(debrief.top_strengths || []).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="coach-section" style={{ marginTop: 0 }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: 6, color: "#fcd34d" }}>
                <Target size={14} /> Priority Improvements
              </h4>
              <ul>
                {(debrief.priority_improvements || []).map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {debrief?.next_drill_plan && (
          <div className="coach-section">
            <h4>Recommended Next Drill</h4>
            <p>{debrief.next_drill_plan}</p>
          </div>
        )}

        <div className="row-gap" style={{ marginTop: 20 }}>
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            <RotateCcw size={16} />
            Start New Interview
          </button>
          <button type="button" className="btn btn-secondary" onClick={onViewHistory}>
            <BarChart3 size={16} />
            View Performance History
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 14 }}>
            Question-by-Question Breakdown
          </h3>
          {items.map((item, idx) => {
            const avg = (
              (item.scores.structure +
                item.scores.specificity +
                item.scores.technical_accuracy +
                item.scores.communication) /
              4
            ).toFixed(1);
            return (
              <div key={idx} className="coach-section">
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <div className="row-gap">
                    <span className="chip neutral">
                      Q{item.question_number}
                      {item.is_followup ? " (Follow-up)" : ""}
                    </span>
                    <span className="chip">{item.competency}</span>
                  </div>
                  <span className="chip success">{avg} / 10</span>
                </div>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>{item.question}</p>
                <p className="muted" style={{ marginBottom: 8 }}>
                  Your answer: {item.answer}
                </p>
                {item.coaching?.rewritten_answer && (
                  <p style={{ fontSize: 13, color: "#c7d2fe" }}>
                    <strong>Stronger rewrite:</strong> {item.coaching.rewritten_answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

