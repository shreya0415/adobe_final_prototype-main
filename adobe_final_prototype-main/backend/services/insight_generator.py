# backend/services/insight_generation.py
from typing import Any, Dict, List
from backend.services.llm_client import LLMClient

llm = LLMClient()

async def generate_persona_insights(document_text: str, persona: str, top_k: int = 5) -> Dict[str, Any]:
    """
    Ask the LLM to analyze the document from the persona's perspective and return JSON:
    [{"section": "<short excerpt>", "score": 0-100, "why": "<why relevant>", "actionable": "<one-liner>"}...]
    """
    # keep doc snippet length bounded for large docs; ideally preprocess & chunk in production.
    text_snippet = document_text[:15000]

    prompt = (
        f"You are an assistant creating persona-driven insights.\n"
        f"Persona: {persona}\n\n"
        f"Document excerpt:\n{text_snippet}\n\n"
        "Return a JSON array (ONLY JSON) of up to {top_k} objects, each:"
        '{"section":"<short excerpt from the doc>", "score":<0-100>, "why":"<why this matters to the persona>", "actionable":"<one actionable suggestion>"}\n'
        "Rank them by score descending. Output valid JSON only."
    )

    resp = await llm.chat(prompt=prompt, max_tokens=800, temperature=0.2)
    raw = resp["text"]

    import json
    try:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        data = json.loads(raw[start:end]) if start != -1 and end != -1 else json.loads(raw)
    except Exception:
        data = {"error": "failed to parse LLM response", "raw": raw}

    return {"results": data, "raw": raw}
