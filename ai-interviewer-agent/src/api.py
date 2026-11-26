import io
import os
import tempfile
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pypdf import PdfReader

from src.config import AUDIO_DIR, MODEL, TTS_VOICE, WHISPER_MODEL
from src.orchestrator import InterviewSession
from src.agents.resume_parser import ResumeParserAgent
from src.memory import db as memory
from src.rag import question_store
from src.voice.stt import transcribe

app = FastAPI(title="AI Interview Coach")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

if (FRONTEND_DIST_DIR / "assets").exists():
    app.mount(
        "/assets",
        StaticFiles(directory=str(FRONTEND_DIST_DIR / "assets")),
        name="frontend_assets",
    )

memory.init_db()
SESSIONS: dict[str, InterviewSession] = {}
parser = ResumeParserAgent()


def _extract_resume_file_text(filename: str, content: bytes) -> str:
    lower = (filename or "").lower()
    if lower.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip()
    return content.decode("utf-8", errors="replace").strip()


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model": MODEL,
        "whisper_model": WHISPER_MODEL,
        "tts_voice": TTS_VOICE,
    }


@app.post("/api/parse-profile")
async def parse_profile(
    resume_text: str = Form(""),
    job_description: str = Form(""),
    resume_file: UploadFile | None = File(None),
):
    combined_resume = resume_text.strip()
    if resume_file is not None and resume_file.filename:
        raw_bytes = await resume_file.read()
        if raw_bytes:
            extracted = _extract_resume_file_text(resume_file.filename, raw_bytes)
            combined_resume = f"{extracted}\n\n{combined_resume}".strip()

    if not combined_resume and not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Provide a resume (text or PDF/TXT file) and/or a job description to analyze.",
        )

    try:
        parsed = parser.parse(combined_resume, job_description)
        return {**parsed, "extracted_resume_text": combined_resume}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Profile analysis failed: {exc}")


@app.post("/api/session/start")
def start_session(
    role_type: str = Form(...),
    competencies: str = Form(""),
    num_questions: int = Form(5),
    voice: bool = Form(False),
    seniority: str = Form("mid"),
    resume_text: str = Form(""),
    job_description: str = Form(""),
    focus_areas: str = Form(""),
):
    comp_list = [c.strip() for c in competencies.split(",") if c.strip()]
    focus_list = [f.strip() for f in focus_areas.split(",") if f.strip()]

    try:
        session = InterviewSession(
            role_type=role_type,
            competencies=comp_list,
            num_questions=num_questions,
            voice=voice,
            seniority=seniority,
            resume_text=resume_text,
            job_description=job_description,
            focus_areas=focus_list,
        )
        SESSIONS[session.session_id] = session
        first_question = session.next_question()
        return {
            "session_id": session.session_id,
            "role_type": session.role_type,
            "seniority": session.seniority,
            "competencies": session.competencies,
            **first_question,
        }
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not start interview session: {exc}")


@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
    return session.to_dict()


@app.post("/api/session/{session_id}/answer")
async def submit_answer(
    session_id: str,
    answer_text: str = Form(""),
    audio: UploadFile | None = File(None),
):
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")

    final_answer_text = answer_text.strip()
    if audio is not None:
        suffix = Path(audio.filename or "answer.webm").suffix or ".webm"
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                tmp.write(await audio.read())
                tmp_path = tmp.name
            final_answer_text = transcribe(tmp_path)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Audio transcription failed: {exc}")
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

    if not final_answer_text:
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")

    try:
        feedback_result = session.submit_answer(final_answer_text)
        return {
            "transcript": final_answer_text,
            **feedback_result,
        }
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Answer evaluation failed: {exc}")


@app.post("/api/session/{session_id}/next")
def next_question(session_id: str):
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
    try:
        q = session.next_question()
        if q.get("done"):
            summary = session.finish_session()
            return {"done": True, "summary": summary}
        return q
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not generate next question: {exc}")


@app.post("/api/session/{session_id}/followup")
def followup_question(session_id: str):
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
    try:
        return session.ask_followup()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not generate follow-up: {exc}")


@app.post("/api/session/{session_id}/finish")
def finish_session(session_id: str):
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
    try:
        return session.finish_session()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not generate session debrief: {exc}")


@app.get("/api/history")
def history(role_type: str | None = None, limit: int = 50):
    return {
        "answers": memory.get_history(limit=limit),
        "competency_stats": memory.get_competency_stats(role_type=role_type),
    }


@app.delete("/api/history/{answer_id}")
def delete_history_entry(answer_id: int):
    deleted = memory.delete_history_item(answer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="History record not found.")
    return {"deleted": True}


@app.delete("/api/history")
def clear_all_history():
    memory.clear_history()
    return {"cleared": True}


@app.get("/api/question-bank")
def get_question_bank():
    return {"questions": question_store.list_questions()}


@app.post("/api/question-bank")
def add_to_question_bank(
    text: str = Form(...),
    role_type: str = Form(...),
    competency: str = Form(...),
    difficulty: str = Form("mid"),
):
    if not text.strip() or not role_type.strip() or not competency.strip():
        raise HTTPException(status_code=400, detail="text, role_type, and competency are required.")
    entry = question_store.add_question(text, role_type, competency, difficulty)
    return entry


@app.get("/api/audio/{filename}")
def get_audio(filename: str):
    safe_name = Path(filename).name
    audio_path = AUDIO_DIR / safe_name
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found.")
    return FileResponse(str(audio_path), media_type="audio/mpeg")


@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found.")

    dist_index = FRONTEND_DIST_DIR / "index.html"
    if dist_index.exists():
        target = FRONTEND_DIST_DIR / full_path
        if full_path and target.is_file():
            return FileResponse(str(target))
        return FileResponse(str(dist_index))

    static_index = STATIC_DIR / "index.html"
    if static_index.exists():
        return FileResponse(str(static_index))

    raise HTTPException(status_code=404, detail="Frontend not built yet.")
