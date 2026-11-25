from src.agents.utils import chat_complete, extract_json

EVALUATOR_SYSTEM_PROMPT = """You are a strict, calibrated senior hiring bar-raiser evaluating an interview response.
Given the target role, competency, question, and the candidate's answer, score each dimension from 1 to 10:
- structure: clarity, logical flow (e.g., STAR for behavioral, top-down framing for design/technical)
- specificity: concrete metrics, real examples, technical depth, edge cases rather than vague generalities
- technical_accuracy: correctness, sound tradeoffs, depth appropriate to the role
- communication: conciseness, directness, clarity of explanation

Be honest and calibrated: empty/off-topic/one-line answers score 1-3; vague answers score 4-5; solid structured answers score 6-7; crisp metric-backed deep answers score 8-10.

Respond with ONLY valid JSON matching this schema:
{
  "structure": <int 1-10>,
  "specificity": <int 1-10>,
  "technical_accuracy": <int 1-10>,
  "communication": <int 1-10>,
  "rationale": "<1-2 concise sentences explaining the scores>",
  "strengths": ["<1-2 concrete things the candidate did well>"],
  "gaps": ["<1-2 specific missing elements or weaknesses>"]
}
"""


def _clamp_score(value) -> int:
    try:
        return max(1, min(10, int(round(float(value)))))
    except (TypeError, ValueError):
        return 1


class EvaluatorAgent:
    """Evaluates candidate answers across four calibrated rubric dimensions."""

    def score_answer(
        self,
        question: str,
        answer: str,
        role_type: str = "",
        competency: str = "",
    ) -> dict:
        user_prompt = (
            f"Target Role: {role_type or 'General'}\n"
            f"Target Competency: {competency or 'General'}\n"
            f"Question: {question}\n\n"
            f"Candidate Answer: {answer}"
        )
        raw = chat_complete(
            messages=[
                {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=1200,
            temperature=0.1,
            json_mode=True,
        )
        parsed = extract_json(raw)

        return {
            "structure": _clamp_score(parsed.get("structure")),
            "specificity": _clamp_score(parsed.get("specificity")),
            "technical_accuracy": _clamp_score(parsed.get("technical_accuracy")),
            "communication": _clamp_score(parsed.get("communication")),
            "rationale": str(parsed.get("rationale") or "").strip(),
            "strengths": [str(s).strip() for s in parsed.get("strengths", []) if str(s).strip()][:3],
            "gaps": [str(g).strip() for g in parsed.get("gaps", []) if str(g).strip()][:3],
        }
