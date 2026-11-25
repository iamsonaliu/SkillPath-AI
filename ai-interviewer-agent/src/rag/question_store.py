import json
import uuid
import chromadb
from src.config import QUESTION_BANK_PATH, CHROMA_DIR

_client = chromadb.PersistentClient(path=CHROMA_DIR)
_collection = _client.get_or_create_collection(name="questions")


def _load_bank() -> list[dict]:
    if not QUESTION_BANK_PATH.exists():
        return []
    with open(QUESTION_BANK_PATH, encoding="utf-8") as f:
        return json.load(f)


def index_question_bank(force: bool = False):
    """Load question_bank.json into Chroma if it isn't indexed yet."""
    if not force and _collection.count() > 0:
        return

    questions = _load_bank()
    if not questions:
        return

    _collection.upsert(
        ids=[q["id"] for q in questions],
        documents=[q["text"] for q in questions],
        metadatas=[
            {
                "role_type": q["role_type"],
                "competency": q["competency"],
                "difficulty": q.get("difficulty", "mid"),
            }
            for q in questions
        ],
    )


def retrieve_question(role_type: str, competency: str, exclude_ids: list[str]) -> dict | None:
    """Retrieve a matching unused seed question for this role + competency.
    Returns None when no relevant bank match remains so the InterviewerAgent can
    dynamically craft a fresh role- and resume-specific question instead."""
    index_question_bank()
    if _collection.count() == 0:
        return None

    normalized_role = role_type.strip().lower()
    normalized_comp = competency.strip().lower().replace(" ", "_")

    # First try exact Chroma metadata filter on role_type + competency
    for where in (
        {"$and": [{"role_type": role_type}, {"competency": normalized_comp}]},
        {"competency": normalized_comp},
    ):
        try:
            results = _collection.query(
                query_texts=[f"{competency} interview question for {role_type}"],
                n_results=min(10, _collection.count()),
                where=where,
            )
        except Exception:
            continue

        ids = results.get("ids", [[]])[0]
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        for qid, doc, meta in zip(ids, docs, metas):
            if qid in exclude_ids:
                continue
            meta_role = str(meta.get("role_type", "")).lower()
            # Accept exact role match, General behavioral match, or role substring match
            if (
                meta_role == normalized_role
                or meta_role == "general"
                or meta_role in normalized_role
                or normalized_role in meta_role
            ):
                return {"id": qid, "text": doc, **meta}

    return None


def list_questions() -> list[dict]:
    """Return all questions currently in the question bank."""
    return _load_bank()


def add_question(text: str, role_type: str, competency: str, difficulty: str = "mid") -> dict:
    """Append a custom question to question_bank.json and index it in ChromaDB."""
    questions = _load_bank()
    entry = {
        "id": f"custom_{uuid.uuid4().hex[:8]}",
        "text": text.strip(),
        "role_type": role_type.strip(),
        "competency": competency.strip().lower().replace(" ", "_"),
        "difficulty": difficulty.strip().lower() or "mid",
    }
    questions.append(entry)
    with open(QUESTION_BANK_PATH, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2)

    _collection.upsert(
        ids=[entry["id"]],
        documents=[entry["text"]],
        metadatas=[
            {
                "role_type": entry["role_type"],
                "competency": entry["competency"],
                "difficulty": entry["difficulty"],
            }
        ],
    )
    return entry
