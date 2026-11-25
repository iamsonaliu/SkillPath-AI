const API_BASE = "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null
        ? data.detail || JSON.stringify(data)
        : String(data);
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  health: () => request("/api/health"),

  parseProfile: ({ resumeText, jobDescription, resumeFile }) => {
    const form = new FormData();
    form.append("resume_text", resumeText || "");
    form.append("job_description", jobDescription || "");
    if (resumeFile) {
      form.append("resume_file", resumeFile);
    }
    return request("/api/parse-profile", { method: "POST", body: form });
  },

  startSession: ({
    roleType,
    seniority,
    competencies,
    numQuestions,
    voice,
    resumeText,
    jobDescription,
    focusAreas,
  }) => {
    const form = new FormData();
    form.append("role_type", roleType);
    form.append("seniority", seniority || "mid");
    form.append("competencies", (competencies || []).join(","));
    form.append("num_questions", String(numQuestions || 5));
    form.append("voice", String(Boolean(voice)));
    form.append("resume_text", resumeText || "");
    form.append("job_description", jobDescription || "");
    form.append("focus_areas", (focusAreas || []).join(","));
    return request("/api/session/start", { method: "POST", body: form });
  },

  getSession: (sessionId) => request(`/api/session/${sessionId}`),

  submitAnswer: (sessionId, { answerText, audioBlob }) => {
    const form = new FormData();
    if (audioBlob) {
      form.append("audio", audioBlob, "answer.webm");
    } else {
      form.append("answer_text", answerText || "");
    }
    return request(`/api/session/${sessionId}/answer`, {
      method: "POST",
      body: form,
    });
  },

  nextQuestion: (sessionId) =>
    request(`/api/session/${sessionId}/next`, { method: "POST" }),

  followupQuestion: (sessionId) =>
    request(`/api/session/${sessionId}/followup`, { method: "POST" }),

  finishSession: (sessionId) =>
    request(`/api/session/${sessionId}/finish`, { method: "POST" }),

  getHistory: (roleType = "") => {
    const qs = roleType ? `?role_type=${encodeURIComponent(roleType)}` : "";
    return request(`/api/history${qs}`);
  },

  deleteHistoryItem: (id) =>
    request(`/api/history/${id}`, { method: "DELETE" }),

  clearHistory: () => request("/api/history", { method: "DELETE" }),

  getQuestionBank: () => request("/api/question-bank"),

  addQuestion: ({ text, roleType, competency, difficulty }) => {
    const form = new FormData();
    form.append("text", text);
    form.append("role_type", roleType);
    form.append("competency", competency);
    form.append("difficulty", difficulty || "mid");
    return request("/api/question-bank", { method: "POST", body: form });
  },

  audioUrl: (filename) => `${API_BASE}/api/audio/${encodeURIComponent(filename)}`,
};

