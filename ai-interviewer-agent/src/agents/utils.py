import json
import re
from groq import Groq, NotFoundError
from src.config import GROQ_API_KEY, MODEL

_client = None
FALLBACK_MODELS = ("openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b")


def get_groq_client() -> Groq:
    """Return a shared Groq client instance."""
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


def chat_complete(
    messages: list[dict],
    max_tokens: int = 1200,
    temperature: float = 0.3,
    json_mode: bool = False,
) -> str:
    """Call Groq chat completions with model fallback if the configured model is unavailable."""
    client = get_groq_client()
    candidates = [MODEL] + [m for m in FALLBACK_MODELS if m != MODEL]
    kwargs: dict = {
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    last_err = None
    for model_name in candidates:
        try:
            response = client.chat.completions.create(model=model_name, **kwargs)
            content = (response.choices[0].message.content or "").strip()
            if content:
                return content
        except NotFoundError as err:
            last_err = err
            continue

    if last_err:
        raise last_err
    raise RuntimeError("Model returned an empty response.")


def extract_json(raw_text: str) -> dict:
    """Parse JSON from an LLM response, stripping optional markdown code fences."""
    cleaned = raw_text.strip()
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if fence_match:
        cleaned = fence_match.group(1).strip()

    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end > start:
        data = json.loads(cleaned[start : end + 1])
        if isinstance(data, dict):
            return data

    raise ValueError(f"Model did not return valid JSON object: {raw_text[:200]}")
