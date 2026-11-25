import json
import sqlite3
from datetime import datetime, timezone
from src.config import DB_PATH


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def init_db():
    conn = _connect()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            role_type TEXT NOT NULL,
            seniority TEXT DEFAULT 'mid',
            competencies_json TEXT,
            num_questions INTEGER,
            voice INTEGER DEFAULT 0,
            created_at TEXT,
            completed_at TEXT,
            debrief_json TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role_type TEXT NOT NULL,
            question_id TEXT,
            competency TEXT,
            question TEXT,
            answer TEXT,
            structure INTEGER,
            specificity INTEGER,
            technical_accuracy INTEGER,
            communication INTEGER,
            rationale TEXT,
            feedback TEXT,
            question_number INTEGER,
            is_followup INTEGER DEFAULT 0,
            created_at TEXT
        )
        """
    )

    # Safe column migration for pre-existing databases
    existing_cols = {
        row["name"] for row in conn.execute("PRAGMA table_info(answers)").fetchall()
    }
    migrations = {
        "rationale": "TEXT",
        "feedback": "TEXT",
        "question_number": "INTEGER",
        "is_followup": "INTEGER DEFAULT 0",
    }
    for col, col_type in migrations.items():
        if col not in existing_cols:
            conn.execute(f"ALTER TABLE answers ADD COLUMN {col} {col_type}")

    conn.commit()
    conn.close()


def create_session_record(
    session_id: str,
    role_type: str,
    seniority: str,
    competencies: list[str],
    num_questions: int,
    voice: bool,
):
    conn = _connect()
    conn.execute(
        """
        INSERT OR REPLACE INTO sessions
        (session_id, role_type, seniority, competencies_json, num_questions, voice, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            session_id,
            role_type,
            seniority,
            json.dumps(competencies),
            num_questions,
            1 if voice else 0,
            _utc_now(),
        ),
    )
    conn.commit()
    conn.close()


def complete_session_record(session_id: str, debrief: dict | None = None):
    conn = _connect()
    conn.execute(
        """
        UPDATE sessions
        SET completed_at = ?, debrief_json = ?
        WHERE session_id = ?
        """,
        (_utc_now(), json.dumps(debrief) if debrief else None, session_id),
    )
    conn.commit()
    conn.close()


def save_answer(
    session_id: str,
    role_type: str,
    question_id: str,
    competency: str,
    question: str,
    answer: str,
    scores: dict,
    feedback_text: str = "",
    question_number: int = 1,
    is_followup: bool = False,
):
    conn = _connect()
    conn.execute(
        """
        INSERT INTO answers
        (session_id, role_type, question_id, competency, question, answer,
         structure, specificity, technical_accuracy, communication,
         rationale, feedback, question_number, is_followup, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            session_id,
            role_type,
            question_id,
            competency,
            question,
            answer,
            scores.get("structure"),
            scores.get("specificity"),
            scores.get("technical_accuracy"),
            scores.get("communication"),
            scores.get("rationale", ""),
            feedback_text,
            question_number,
            1 if is_followup else 0,
            _utc_now(),
        ),
    )
    conn.commit()
    conn.close()


def get_weakest_competency(role_type: str) -> str | None:
    """Returns the competency with the lowest average overall score for this role."""
    conn = _connect()
    row = conn.execute(
        """
        SELECT competency,
               AVG((structure + specificity + technical_accuracy + communication) / 4.0) AS avg_score
        FROM answers
        WHERE LOWER(role_type) = LOWER(?) AND competency IS NOT NULL
        GROUP BY competency
        ORDER BY avg_score ASC
        LIMIT 1
        """,
        (role_type,),
    ).fetchone()
    conn.close()
    return row["competency"] if row else None


def get_history(limit: int = 50) -> list[dict]:
    conn = _connect()
    rows = conn.execute(
        """
        SELECT id, session_id, role_type, competency, question, answer,
               structure, specificity, technical_accuracy, communication,
               rationale, feedback, question_number, is_followup, created_at
        FROM answers
        ORDER BY created_at DESC, id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_competency_stats(role_type: str | None = None) -> list[dict]:
    conn = _connect()
    query = """
        SELECT competency,
               COUNT(*) AS attempts,
               ROUND(AVG(structure), 2) AS avg_structure,
               ROUND(AVG(specificity), 2) AS avg_specificity,
               ROUND(AVG(technical_accuracy), 2) AS avg_technical_accuracy,
               ROUND(AVG(communication), 2) AS avg_communication,
               ROUND(AVG((structure + specificity + technical_accuracy + communication) / 4.0), 2) AS avg_overall
        FROM answers
        WHERE competency IS NOT NULL
    """
    params: tuple = ()
    if role_type:
        query += " AND LOWER(role_type) = LOWER(?)"
        params = (role_type,)
    query += " GROUP BY competency ORDER BY avg_overall ASC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_history_item(answer_id: int) -> bool:
    conn = _connect()
    cur = conn.execute("DELETE FROM answers WHERE id = ?", (answer_id,))
    conn.commit()
    conn.close()
    return cur.rowcount > 0


def clear_history():
    conn = _connect()
    conn.execute("DELETE FROM answers")
    conn.execute("DELETE FROM sessions")
    conn.commit()
    conn.close()
