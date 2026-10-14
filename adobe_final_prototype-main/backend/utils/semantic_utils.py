# semantic_utils.py
from __future__ import annotations
from typing import List, Dict
import os
import unicodedata
import json
from openai import OpenAI

# --- Global OpenAI Client ---
# It's good practice to initialize the client once.
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- Helper Function (Unchanged) ---
def _sanitize_unicode(text: str) -> str:
    """Cleans and normalizes Unicode text to prevent encoding issues."""
    if not isinstance(text, str):
        text = str(text)
    
    text = unicodedata.normalize('NFC', text)
    
    replacements = {
        '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
        '\u2013': '-', '\u2014': '-', '\u2026': '...',
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
        
    text = ''.join(char for char in text if unicodedata.category(char) != 'Cc' or char in '\n\r\t')
    
    try:
        text.encode('utf-8')
        return text
    except UnicodeEncodeError:
        return text.encode('utf-8', errors='replace').decode('utf-8')


# --- MAIN ANALYSIS FUNCTION (REFACTORED FOR SPEED AND BREVITY) ---
def analyze_documents(
    documents: List[Dict[str, str]],
    persona: str,
    task: str,
    model: str = "gpt-4o-mini"  # gpt-4o-mini is excellent for speed and cost
) -> Dict:
    """
    Analyzes all documents in a single API call for maximum speed and conciseness.
    """
    sanitized_persona = _sanitize_unicode(persona)
    sanitized_task = _sanitize_unicode(task)

    # 1. Combine all document texts into a single string for the prompt.
    # This is the key to reducing API calls from N+1 to just 1.
    combined_text = []
    for doc in documents:
        name = _sanitize_unicode(str(doc.get("name", "Unnamed Document")))
        text = _sanitize_unicode(str(doc.get("text", "")))
        combined_text.append(f"--- DOCUMENT: {name} ---\n{text}\n--- END DOCUMENT ---")
    
    full_context = "\n\n".join(combined_text)

    # 2. Create a new, highly-focused prompt.
    # This prompt instructs the model to be brief and to return a JSON object,
    # which is faster and more reliable than parsing plain text.
    final_prompt = f"""
You are an AI assistant acting as **{sanitized_persona}**.
Your task is: **{sanitized_task}**.

Analyze the provided documents and perform the following actions:
1.  For EACH document, extract 3-5 concise bullet points that are directly relevant to the task.
2.  After analyzing all documents, write a final, consolidated summary of no more than 150 words.

The output MUST be a JSON object with the following structure:
{{
  "document_highlights": [
    {{ "name": "filename.pdf", "highlights": "- Highlight 1\\n- Highlight 2" }},
    ...
  ],
  "final_summary": "Your concise final summary here."
}}

Here is the full context of all documents:
{full_context}
"""

    try:
        # 3. Make a single API call requesting a JSON response.
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": final_prompt}],
            temperature=0.1,  # Lower temperature for more focused, less creative output
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("The AI model returned an empty response.")

        # 4. Parse the JSON response from the model.
        parsed_result = json.loads(content)
        
        # Structure the data for the frontend.
        # We use .get() to safely access keys that might be missing.
        final_summary = _sanitize_unicode(parsed_result.get("final_summary", "No summary provided."))
        doc_highlights = parsed_result.get("document_highlights", [])

        # Sanitize the highlights received from the model
        for item in doc_highlights:
            item["highlights"] = _sanitize_unicode(item.get("highlights", ""))
            item["name"] = _sanitize_unicode(item.get("name", "Unknown Document"))

    except Exception as e:
        error_msg = _sanitize_unicode(str(e))
        print(f"[Error in single-call analysis: {error_msg}]")
        # Provide a fallback error structure
        final_summary = f"[Error analyzing results: {error_msg}]"
        doc_highlights = [{"name": doc['name'], "highlights": "Error during analysis."} for doc in documents]

    # 5. Return the final, structured dictionary.
    return {
        "persona": sanitized_persona,
        "task": sanitized_task,
        "documents": doc_highlights,
        "summary": final_summary
    }
