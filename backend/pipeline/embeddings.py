import os
import json
import urllib.request

EMBED_MODEL = "gemini-embedding-001"
OUTPUT_DIM = 768  # match Pinecone index dimension


def embed(text: str) -> list[float]:
    api_key = os.getenv("GOOGLE_API_KEY")
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{EMBED_MODEL}:embedContent?key={api_key}"
    )
    body = {
        "model": f"models/{EMBED_MODEL}",
        "content": {"parts": [{"text": text}]},
        "outputDimensionality": OUTPUT_DIM,
    }
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    return result["embedding"]["values"]
