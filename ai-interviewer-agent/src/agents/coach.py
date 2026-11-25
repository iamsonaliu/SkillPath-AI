from src.agents.utils import chat_complete, extract_json

COACH_SYSTEM_PROMPT = """You are a supportive, direct senior interview coach.
Given the question, the candidate's answer, and their rubric scores, return ONLY valid JSON:
{
  "tips": [
    "<Specific, actionable tip #1 tied directly to what the candidate said or missed>",
    "<Specific, actionable tip #2 tied directly to structure, metrics, or technical tradeoffs>"
  ],
  "rewritten_answer": "<A crisp, stronger 4-6 sentence rewrite of their answer using STAR or structured framing>",
  "takeaway": "<One motivating, honest closing sentence>"
}
"""

DEBRIEF_SYSTEM_PROMPT = """You are an executive interview coach summarizing a completed mock interview session.
Given the role, competencies, and each question with scores and rationale, return ONLY valid JSON:
{
  "overall_verdict": "<e.g., 'Strong Hire Signal', 'Promising - Needs Depth', 'Early Stage - Drill Fundamentals'>",
  "summary": "<2-3 sentence synthesis of overall performance across the session>",
  "top_strengths": ["<2-3 observed strengths across answers>"],
  "priority_improvements": ["<2-3 highest-leverage improvements to focus on next>"],
  "next_drill_plan": "<1-2 sentence concrete recommendation for the next practice session>"
}
"""


class CoachAgent:
    """Provides actionable per-answer coaching and end-of-session debriefs."""

    def give_feedback(self, question: str, answer: str, scores: dict) -> dict:
        user_prompt = (
            f"Question: {question}\n\n"
            f"Candidate answer: {answer}\n\n"
            f"Scores & rationale: {scores}"
        )
        raw = chat_complete(
            messages=[
                {"role": "system", "content": COACH_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=1400,
            temperature=0.3,
            json_mode=True,
        )
        parsed = extract_json(raw)

        tips = [str(t).strip() for t in parsed.get("tips", []) if str(t).strip()][:3]
        rewritten = str(parsed.get("rewritten_answer") or "").strip()
        takeaway = str(parsed.get("takeaway") or "").strip()

        # Flat text representation for TTS and plain-text consumers
        tips_text = " ".join(f"Tip {i + 1}: {tip}" for i, tip in enumerate(tips))
        plain_text = f"{tips_text}\n\nStronger rewrite: {rewritten}\n\n{takeaway}".strip()

        return {
            "tips": tips,
            "rewritten_answer": rewritten,
            "takeaway": takeaway,
            "text": plain_text,
        }

    def summarize_session(self, role_type: str, history_items: list[dict]) -> dict:
        condensed = [
            {
                "question_number": idx + 1,
                "competency": item.get("competency"),
                "question": item.get("question"),
                "scores": item.get("scores"),
            }
            for idx, item in enumerate(history_items)
        ]
        raw = chat_complete(
            messages=[
                {"role": "system", "content": DEBRIEF_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Role: {role_type}\n\nSession Transcript Summary:\n{condensed}",
                },
            ],
            max_tokens=1400,
            temperature=0.25,
            json_mode=True,
        )
        parsed = extract_json(raw)
        return {
            "overall_verdict": str(parsed.get("overall_verdict") or "Session Completed").strip(),
            "summary": str(parsed.get("summary") or "").strip(),
            "top_strengths": [str(s).strip() for s in parsed.get("top_strengths", []) if str(s).strip()][:4],
            "priority_improvements": [
                str(p).strip() for p in parsed.get("priority_improvements", []) if str(p).strip()
            ][:4],
            "next_drill_plan": str(parsed.get("next_drill_plan") or "").strip(),
        }
