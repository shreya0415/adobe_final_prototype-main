import os
import requests
from openai import OpenAI

# --- SETUP ---
# Initializes the OpenAI client by reading the API key from your environment variables.
# Make sure you have set OPENAI_API_KEY in your environment.
try:
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
except Exception as e:
    print(f"Error initializing OpenAI client: {e}")
    client = None

# --- NEW EMBEDDING FUNCTION ---
def get_embeddings(texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    """
    Generates embedding vectors for a list of texts using OpenAI's API.

    Args:
        texts (list[str]): A list of strings to be embedded.
        model (str): The embedding model to use.

    Returns:
        list[list[float]]: A list of embedding vectors.
    """
    if not client:
        raise ValueError("OpenAI client is not initialized. Please set your OPENAI_API_KEY.")

    # OpenAI recommends replacing newlines to avoid performance issues.
    texts = [text.replace("\n", " ") for text in texts]
    
    try:
        response = client.embeddings.create(input=texts, model=model)
        return [embedding.embedding for embedding in response.data]
    except Exception as e:
        print(f"An error occurred while calling the OpenAI embeddings API: {e}")
        # Return empty embeddings of the correct shape to prevent crashes downstream
        return [[] for _ in texts]


# --- EXISTING FUNCTION (UNCHANGED) ---
LOCAL_MODEL_URL = "http://127.0.0.1:8080/completion"  # Adjust to your llama.cpp endpoint

def get_persona_response(prompt: str):
    try:
        payload = {
            "prompt": prompt,
            "temperature": 0.7,
            "max_tokens": 500,
        }
        response = requests.post(LOCAL_MODEL_URL, json=payload)
        response.raise_for_status()
        return response.json().get("content", "")
    except Exception as e:
        return f"Error: {e}"