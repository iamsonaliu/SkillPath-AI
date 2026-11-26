from src.agents.utils import chat_complete

INTERVIEWER_SYSTEM_PROMPT = """You are an experienced, sharp interviewer conducting a live realistic interview.
Rules:
- Ask ONE focused, direct interview question in 1-3 natural conversational sentences.
- Do not add filler preamble like "Great, thanks for sharing, here's a question".
- Never repeat any previously asked question in this session.
- If candidate resume/JD context or focus areas are provided, tailor the question to probe real skills, tradeoffs, or experiences relevant to their target role.
- If a seed question from the question bank is provided and fits the role/competency, adapt and naturalize it (you may tailor it to the candidate's context). If no seed is provided, craft a fresh, high-signal question for the role and competency.
"""

FOLLOWUP_SYSTEM_PROMPT = """You are an experienced interviewer conducting a live interview.
Based on the candidate's answer to the previous question, ask ONE sharp, natural follow-up probing question in 1-2 sentences.
Target the specific gap, vague claim, or interesting technical/leadership tradeoff in what they just said.
Do not praise or give coaching feedback — stay strictly in interviewer character.
"""


class InterviewerAgent:
    """Crafts dynamic, role- and context-aware interview questions and follow-ups."""

    def __init__(
        self,
        role_type: str,
        seniority: str = "mid",
        resume_text: str = "",
        job_description: str = "",
        focus_areas: list[str] | None = None,
    ):
        self.role_type = role_type
        self.seniority = seniority
        self.resume_text = resume_text[:2000] if resume_text else ""
        self.job_description = job_description[:2000] if job_description else ""
        self.focus_areas = focus_areas or []

    def generate_question(
        self,
        competency: str,
        seed_question: str | None = None,
        previous_questions: list[str] | None = None,
    ) -> str:
        context_parts = [
            f"Target role: {self.role_type} ({self.seniority} level)",
            f"Target competency to evaluate: {competency}",
        ]
        if self.focus_areas:
            context_parts.append(f"Key focus areas: {', '.join(self.focus_areas)}")
        if self.job_description:
            context_parts.append(f"Job description excerpt:\n{self.job_description[:900]}")
        if self.resume_text:
            context_parts.append(f"Candidate resume excerpt:\n{self.resume_text[:900]}")
        if seed_question:
            context_parts.append(f"Reference seed question (adapt naturally): {seed_question}")
        if previous_questions:
            joined = "\n- ".join(previous_questions[-8:])
            context_parts.append(f"Already asked in this session (do NOT repeat):\n- {joined}")

        return chat_complete(
            messages=[
                {"role": "system", "content": INTERVIEWER_SYSTEM_PROMPT},
                {"role": "user", "content": "\n\n".join(context_parts)},
            ],
            max_tokens=1000,
            temperature=0.65,
        )

    def generate_followup(self, question: str, answer: str, gaps: list[str] | None = None) -> str:
        prompt = (
            f"Target role: {self.role_type} ({self.seniority})\n"
            f"Previous question: {question}\n"
            f"Candidate answer: {answer}\n"
        )
        if gaps:
            prompt += f"Potential gaps to probe: {', '.join(gaps)}\n"

        return chat_complete(
            messages=[
                {"role": "system", "content": FOLLOWUP_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_tokens=1000,
            temperature=0.5,
        )
