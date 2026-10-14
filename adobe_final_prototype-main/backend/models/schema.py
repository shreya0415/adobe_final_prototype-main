from pydantic import BaseModel
from typing import Optional

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5

class InsightRequest(BaseModel):
    doc_id: Optional[str] = None
    section_id: Optional[str] = None
    persona: Optional[str] = None
