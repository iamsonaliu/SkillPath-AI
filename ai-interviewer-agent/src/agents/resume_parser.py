from src.agents.utils import chat_complete, extract_json

PARSER_SYSTEM_PROMPT = """You are an expert technical recruiter and interview architect.
Analyze the candidate's resume and/or job description and extract structured, tailored interview parameters.

Return ONLY valid JSON matching this schema:
{
  "role_type": "<specific target role title inferred from the JD or resume, e.g. 'Senior Frontend Engineer', 'AI Engineer', 'Technical Program Manager', 'Data Scientist', 'Software Engineer'>",
  "seniority": "<one of: 'entry', 'mid', 'senior', 'staff'>",
  "competencies": ["<4 to 5 concise snake_case competencies most critical for THIS specific role and JD, e.g. system_design, react_architecture, leadership, technical_depth, ambiguity, stakeholder_management, product_sense, problem_solving>"],
  "key_skills": ["<up to 8 key technologies, frameworks, or domain skills mentioned>"],
  "focus_areas": ["<3 to 4 specific project themes, architecture topics, or experience gaps from the resume/JD to probe during the interview>"],
  "summary": "<1-2 sentence summary of the candidate-role fit and what the interview should focus on>"
}
"""


class ResumeParserAgent:
    """Extracts dynamic role, competencies, skills, and probe areas from resume/JD."""

    def parse(self, resume_text: str, job_description: str) -> dict:
        user_prompt = (
            f"Resume:\n{resume_text.strip() or 'Not provided'}\n\n"
            f"Job description:\n{job_description.strip() or 'Not provided'}"
        )
        raw = chat_complete(
            messages=[
                {"role": "system", "content": PARSER_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=1200,
            temperature=0.2,
            json_mode=True,
        )
        parsed = extract_json(raw)

        competencies = [
            str(c).strip().lower().replace(" ", "_")
            for c in parsed.get("competencies", [])
            if str(c).strip()
        ]
        if not competencies:
            competencies = ["problem_solving", "technical_depth", "communication", "ambiguity"]

        seniority = str(parsed.get("seniority", "mid")).lower()
        if seniority not in {"entry", "mid", "senior", "staff"}:
            seniority = "mid"

        return {
            "role_type": str(parsed.get("role_type") or "Software Engineer").strip(),
            "seniority": seniority,
            "competencies": competencies[:6],
            "key_skills": [str(s).strip() for s in parsed.get("key_skills", []) if str(s).strip()][:10],
            "focus_areas": [str(f).strip() for f in parsed.get("focus_areas", []) if str(f).strip()][:5],
            "summary": str(parsed.get("summary") or "").strip(),
        }
