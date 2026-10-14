from fastapi import APIRouter
from services.llm_client import get_persona_response

router = APIRouter(tags=["Insights"])

@router.post("/insights")
async def persona_analysis(data: dict):
    prompt = data.get("prompt", "")
    result = get_persona_response(prompt)
    return {"response": result}
