import uuid
from src.agents.interviewer import InterviewerAgent
from src.agents.evaluator import EvaluatorAgent
from src.agents.coach import CoachAgent
from src.rag.question_store import retrieve_question
from src.memory import db as memory
from src.voice.tts import synthesize_to_file


class InterviewSession:
    def __init__(
        self,
        role_type: str,
        competencies: list[str],
        num_questions: int,
        voice: bool,
        seniority: str = "mid",
        resume_text: str = "",
        job_description: str = "",
        focus_areas: list[str] | None = None,
    ):
        self.session_id = uuid.uuid4().hex
        self.role_type = role_type.strip() or "Software Engineer"
        self.seniority = seniority
        self.competencies = [c.strip() for c in competencies if c.strip()] or [
            "problem_solving",
            "technical_depth",
            "communication",
            "ambiguity",
        ]
        self.num_questions = max(1, min(15, int(num_questions)))
        self.voice = voice
        self.resume_text = resume_text
        self.job_description = job_description
        self.focus_areas = focus_areas or []

        self.interviewer = InterviewerAgent(
            role_type=self.role_type,
            seniority=self.seniority,
            resume_text=self.resume_text,
            job_description=self.job_description,
            focus_areas=self.focus_areas,
        )
        self.evaluator = EvaluatorAgent()
        self.coach = CoachAgent()

        self.asked_ids: list[str] = []
        self.asked_questions: list[str] = []
        self.asked_competencies: list[str] = []
        self.question_count = 0
        self.done = False
        self.current_question: dict | None = None
        self.qa_history: list[dict] = []
        self.debrief: dict | None = None

        memory.create_session_record(
            session_id=self.session_id,
            role_type=self.role_type,
            seniority=self.seniority,
            competencies=self.competencies,
            num_questions=self.num_questions,
            voice=self.voice,
        )

    def _pick_competency(self) -> str:
        """Prioritize the historically weakest competency first, then rotate
        through remaining session competencies so every question covers fresh ground."""
        weakest = memory.get_weakest_competency(self.role_type)
        unasked = [c for c in self.competencies if c not in self.asked_competencies]
        if unasked:
            if weakest and weakest in unasked:
                return weakest
            return unasked[0]
        return self.competencies[self.question_count % len(self.competencies)]

    def next_question(self) -> dict:
        if self.question_count >= self.num_questions:
            self.done = True
            return {"done": True}

        competency = self._pick_competency()
        seed = retrieve_question(self.role_type, competency, self.asked_ids)
        seed_id = seed["id"] if seed else f"dynamic_{uuid.uuid4().hex[:8]}"
        seed_text = seed["text"] if seed else None

        if seed:
            self.asked_ids.append(seed_id)

        phrased = self.interviewer.generate_question(
            competency=competency,
            seed_question=seed_text,
            previous_questions=self.asked_questions,
        )
        self.asked_questions.append(phrased)
        self.asked_competencies.append(competency)
        self.question_count += 1

        self.current_question = {
            "id": seed_id,
            "seed_text": seed_text,
            "competency": competency,
            "text": phrased,
            "question_number": self.question_count,
            "is_followup": False,
            "source": "rag_adapted" if seed else "dynamic_generated",
        }

        result = {
            "done": False,
            "question_number": self.question_count,
            "total_questions": self.num_questions,
            "competency": competency,
            "source": self.current_question["source"],
            "is_followup": False,
            "question": phrased,
        }
        if self.voice:
            result["question_audio"] = synthesize_to_file(phrased)
        return result

    def ask_followup(self) -> dict:
        """Generate a dynamic follow-up question probing the most recent answer."""
        if not self.qa_history:
            raise ValueError("No answered question to follow up on.")

        last = self.qa_history[-1]
        followup_text = self.interviewer.generate_followup(
            question=last["question"],
            answer=last["answer"],
            gaps=last["scores"].get("gaps", []),
        )
        self.asked_questions.append(followup_text)

        self.current_question = {
            "id": f"followup_{uuid.uuid4().hex[:8]}",
            "seed_text": None,
            "competency": last["competency"],
            "text": followup_text,
            "question_number": last["question_number"],
            "is_followup": True,
            "source": "dynamic_followup",
        }

        result = {
            "done": False,
            "question_number": last["question_number"],
            "total_questions": self.num_questions,
            "competency": last["competency"],
            "source": "dynamic_followup",
            "is_followup": True,
            "question": followup_text,
        }
        if self.voice:
            result["question_audio"] = synthesize_to_file(followup_text)
        return result

    def submit_answer(self, answer_text: str) -> dict:
        if not self.current_question:
            raise ValueError("No active question to answer.")

        q = self.current_question
        scores = self.evaluator.score_answer(
            question=q["text"],
            answer=answer_text,
            role_type=self.role_type,
            competency=q["competency"],
        )
        coaching = self.coach.give_feedback(q["text"], answer_text, scores)

        memory.save_answer(
            session_id=self.session_id,
            role_type=self.role_type,
            question_id=q["id"],
            competency=q["competency"],
            question=q["text"],
            answer=answer_text,
            scores=scores,
            feedback_text=coaching["text"],
            question_number=q.get("question_number", self.question_count),
            is_followup=bool(q.get("is_followup")),
        )

        record = {
            "question_number": q.get("question_number", self.question_count),
            "competency": q["competency"],
            "question": q["text"],
            "answer": answer_text,
            "is_followup": bool(q.get("is_followup")),
            "scores": scores,
            "coaching": coaching,
        }
        self.qa_history.append(record)

        is_last = self.question_count >= self.num_questions
        result = {
            "scores": scores,
            "coaching": coaching,
            "feedback": coaching["text"],
            "competency": q["competency"],
            "is_followup": bool(q.get("is_followup")),
            "is_last": is_last,
        }
        if self.voice:
            result["feedback_audio"] = synthesize_to_file(coaching["text"])
        return result

    def finish_session(self) -> dict:
        self.done = True
        if self.debrief is None and self.qa_history:
            self.debrief = self.coach.summarize_session(self.role_type, self.qa_history)
            memory.complete_session_record(self.session_id, self.debrief)
        return {
            "session_id": self.session_id,
            "role_type": self.role_type,
            "seniority": self.seniority,
            "competencies": self.competencies,
            "qa_history": self.qa_history,
            "debrief": self.debrief,
        }

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "role_type": self.role_type,
            "seniority": self.seniority,
            "competencies": self.competencies,
            "num_questions": self.num_questions,
            "voice": self.voice,
            "question_count": self.question_count,
            "done": self.done,
            "current_question": self.current_question,
            "qa_history": self.qa_history,
            "debrief": self.debrief,
        }
