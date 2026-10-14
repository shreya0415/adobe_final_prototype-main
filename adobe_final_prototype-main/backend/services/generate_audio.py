import os
from pathlib import Path
import openai

def generate_audio(text, voice, output_file):
    openai.api_key = os.getenv("OPENAI_API_KEY")

    with openai.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice=voice,
        input=text
    ) as response:
        response.stream_to_file(Path(output_file))

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 4:
        print("Usage: python generate_audio.py <text> <voice> <output_file>")
        sys.exit(1)
    _, text, voice, output_file = sys.argv
    generate_audio(text, voice, output_file)
