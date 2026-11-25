import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  Send,
  ArrowRight,
  MessageSquarePlus,
  Flag,
  Loader2,
  Volume2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { api } from "../api";

const SCORE_DIMENSIONS = [
  { key: "structure", label: "Structure" },
  { key: "specificity", label: "Specificity" },
  { key: "technical_accuracy", label: "Technical Accuracy" },
  { key: "communication", label: "Communication" },
];

function scoreColor(val) {
  if (val >= 8) return "#10b981";
  if (val >= 6) return "#6366f1";
  if (val >= 4) return "#f59e0b";
  return "#ef4444";
}

export default function InterviewView({ initialSession, onComplete }) {
  const [session] = useState({
    sessionId: initialSession.session_id,
    roleType: initialSession.role_type,
    seniority: initialSession.seniority,
  });

  const [question, setQuestion] = useState(initialSession);
  const [answerText, setAnswerText] = useState("");
  const [useVoiceInput, setUseVoiceInput] = useState(Boolean(initialSession.question_audio));

  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const questionAudioRef = useRef(null);
  const feedbackAudioRef = useRef(null);

  useEffect(() => {
    if (question?.question_audio && questionAudioRef.current) {
      questionAudioRef.current.load();
      questionAudioRef.current.play().catch(() => {});
    }
  }, [question?.question_audio]);

  useEffect(() => {
    if (evaluation?.feedback_audio && feedbackAudioRef.current) {
      feedbackAudioRef.current.load();
      feedbackAudioRef.current.play().catch(() => {});
    }
  }, [evaluation?.feedback_audio]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedPreviewUrl) URL.revokeObjectURL(recordedPreviewUrl);
    };
  }, [recordedPreviewUrl]);

  async function toggleRecording() {
    setError("");
    if (recording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerRef.current);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        if (recordedPreviewUrl) URL.revokeObjectURL(recordedPreviewUrl);
        setRecordedPreviewUrl(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordedBlob(null);
      setRecordSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      setError(`Microphone access error: ${err.message}`);
    }
  }

  async function handleSubmitAnswer() {
    setError("");
    if (!recordedBlob && !answerText.trim()) {
      setError("Please type an answer or record a voice response before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.submitAnswer(session.sessionId, {
        answerText: recordedBlob ? "" : answerText,
        audioBlob: recordedBlob,
      });
      setEvaluation(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNextQuestion() {
    setError("");
    setAdvancing(true);
    try {
      const res = await api.nextQuestion(session.sessionId);
      if (res.done) {
        onComplete(res.summary);
        return;
      }
      resetForNewQuestion(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdvancing(false);
    }
  }

  async function handleFollowup() {
    setError("");
    setAdvancing(true);
    try {
      const res = await api.followupQuestion(session.sessionId);
      resetForNewQuestion(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdvancing(false);
    }
  }

  async function handleFinishEarly() {
    setError("");
    setAdvancing(true);
    try {
      const summary = await api.finishSession(session.sessionId);
      onComplete(summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdvancing(false);
    }
  }

  function resetForNewQuestion(nextQ) {
    setQuestion(nextQ);
    setEvaluation(null);
    setAnswerText("");
    setRecordedBlob(null);
    if (recordedPreviewUrl) {
      URL.revokeObjectURL(recordedPreviewUrl);
      setRecordedPreviewUrl("");
    }
  }

  const progressPct = Math.round(
    ((question.question_number || 1) / (question.total_questions || 1)) * 100
  );

  const avgScore = evaluation?.scores
    ? (
        (evaluation.scores.structure +
          evaluation.scores.specificity +
          evaluation.scores.technical_accuracy +
          evaluation.scores.communication) /
        4
      ).toFixed(1)
    : null;

  return (
    <div>
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div className="row-gap">
            <span className="chip">{session.roleType}</span>
            <span className="chip neutral">{session.seniority}</span>
            {question.competency && (
              <span className="chip warning">Competency: {question.competency}</span>
            )}
            {question.is_followup ? (
              <span className="chip success">Follow-Up Probe</span>
            ) : (
              <span className="chip neutral">
                {question.source === "rag_adapted" ? "RAG Seed Adapted" : "AI Tailored"}
              </span>
            )}
          </div>

          <div className="row-gap">
            <span className="muted">
              Question {question.question_number} of {question.total_questions}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleFinishEarly}
              disabled={advancing}
              title="Finish interview and generate debrief"
            >
              <Flag size={14} />
              End Session
            </button>
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="question-box">
          <p className="question-text">{question.question}</p>
          {question.question_audio && (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <Volume2 size={16} color="#9aa7c7" />
              <audio
                ref={questionAudioRef}
                controls
                src={api.audioUrl(question.question_audio)}
                style={{ height: 34, width: "100%" }}
              />
            </div>
          )}
        </div>

        {!evaluation ? (
          <div>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="muted">Your Response</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setUseVoiceInput(!useVoiceInput)}
              >
                {useVoiceInput ? "Switch to Text Input" : "Switch to Voice Mic"}
              </button>
            </div>

            {useVoiceInput ? (
              <div className="coach-section" style={{ marginTop: 0 }}>
                <div className="row-gap">
                  <button
                    type="button"
                    className={`btn ${recording ? "btn-danger" : "btn-secondary"}`}
                    onClick={toggleRecording}
                    disabled={submitting}
                  >
                    {recording ? <Square size={15} /> : <Mic size={15} />}
                    {recording ? `Stop Recording (${recordSeconds}s)` : "Start Recording"}
                  </button>
                  {recordedBlob && !recording && (
                    <span className="chip success">Audio captured ({recordSeconds}s)</span>
                  )}
                </div>
                {recordedPreviewUrl && (
                  <audio
                    controls
                    src={recordedPreviewUrl}
                    style={{ marginTop: 12, width: "100%", height: 36 }}
                  />
                )}
              </div>
            ) : (
              <div className="field" style={{ marginBottom: 12 }}>
                <textarea
                  className="textarea"
                  rows={6}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter" && !submitting) {
                      handleSubmitAnswer();
                    }
                  }}
                  placeholder="Structure your response clearly (e.g., Situation, Task, Action, measurable Result or architecture tradeoffs). Ctrl+Enter to submit."
                />
                <div className="row-between" style={{ marginTop: 6 }}>
                  <span className="muted">
                    {answerText.trim() ? answerText.trim().split(/\s+/).length : 0} words
                  </span>
                  <span className="muted">Ctrl + Enter to submit</span>
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitAnswer}
              disabled={submitting || recording}
              style={{ marginTop: 10 }}
            >
              {submitting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              {submitting ? "Evaluating & Coaching..." : "Submit Answer"}
            </button>
          </div>
        ) : (
          <div>
            {evaluation.transcript && (
              <div className="coach-section" style={{ marginBottom: 14 }}>
                <h4>Your Submitted Answer</h4>
                <p>{evaluation.transcript}</p>
              </div>
            )}

            <div className="row-between" style={{ marginTop: 10 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Rubric Evaluation</h3>
              <span className="chip" style={{ fontSize: 13 }}>
                Overall: {avgScore} / 10
              </span>
            </div>

            <div className="score-grid">
              {SCORE_DIMENSIONS.map(({ key, label }) => {
                const val = evaluation.scores?.[key] ?? 0;
                const color = scoreColor(val);
                return (
                  <div key={key} className="score-tile">
                    <div className="score-tile-top">
                      <span className="score-label">{label}</span>
                      <span className="score-val" style={{ color }}>
                        {val}
                      </span>
                    </div>
                    <div className="score-bar">
                      <div
                        className="score-bar-fill"
                        style={{ width: `${val * 10}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {evaluation.scores?.rationale && (
              <div className="coach-section">
                <h4>Evaluator Rationale</h4>
                <p>{evaluation.scores.rationale}</p>
              </div>
            )}

            {(evaluation.scores?.strengths?.length > 0 ||
              evaluation.scores?.gaps?.length > 0) && (
              <div className="grid-2" style={{ marginTop: 14, gap: 14 }}>
                {evaluation.scores.strengths?.length > 0 && (
                  <div className="coach-section" style={{ marginTop: 0 }}>
                    <h4 style={{ display: "flex", alignItems: "center", gap: 6, color: "#6ee7b7" }}>
                      <CheckCircle2 size={14} /> Strengths
                    </h4>
                    <ul>
                      {evaluation.scores.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evaluation.scores.gaps?.length > 0 && (
                  <div className="coach-section" style={{ marginTop: 0 }}>
                    <h4 style={{ display: "flex", alignItems: "center", gap: 6, color: "#fcd34d" }}>
                      <AlertTriangle size={14} /> Gaps to Address
                    </h4>
                    <ul>
                      {evaluation.scores.gaps.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {evaluation.coaching && (
              <div className="coach-section">
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>Coach Feedback &amp; Stronger Rewrite</h4>
                  {evaluation.feedback_audio && (
                    <audio
                      ref={feedbackAudioRef}
                      controls
                      src={api.audioUrl(evaluation.feedback_audio)}
                      style={{ height: 32 }}
                    />
                  )}
                </div>
                {evaluation.coaching.tips?.length > 0 && (
                  <ul style={{ marginBottom: 12 }}>
                    {evaluation.coaching.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                )}
                {evaluation.coaching.rewritten_answer && (
                  <div
                    style={{
                      padding: 12,
                      background: "rgba(99,102,241,0.08)",
                      borderRadius: 8,
                      border: "1px solid rgba(99,102,241,0.25)",
                    }}
                  >
                    <div className="muted" style={{ marginBottom: 4, fontWeight: 600 }}>
                      Stronger Version
                    </div>
                    <p>{evaluation.coaching.rewritten_answer}</p>
                  </div>
                )}
                {evaluation.coaching.takeaway && (
                  <p className="muted" style={{ marginTop: 10 }}>
                    {evaluation.coaching.takeaway}
                  </p>
                )}
              </div>
            )}

            <div className="row-gap" style={{ marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleFollowup}
                disabled={advancing}
              >
                {advancing ? <Loader2 size={15} className="spin" /> : <MessageSquarePlus size={15} />}
                Ask Follow-Up Probe
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextQuestion}
                disabled={advancing}
              >
                {advancing ? <Loader2 size={15} className="spin" /> : <ArrowRight size={15} />}
                {evaluation.is_last ? "Finish & View Debrief" : "Next Question"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

