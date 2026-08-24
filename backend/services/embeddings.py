"""
NVIDIA NIM Embeddings Service
================================
Uses the NVIDIA NIM API (OpenAI-compatible) to generate text embeddings
via nvidia/nv-embedqa-e5-v5 for use in the RAG pipeline.
"""
import os
from openai import OpenAI
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

NVIDIA_API_KEY  = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nvidia/nv-embedqa-e5-v5")

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        if not NVIDIA_API_KEY:
            raise RuntimeError("NVIDIA_API_KEY is not set in environment variables.")
        _client = OpenAI(api_key=NVIDIA_API_KEY, base_url=NVIDIA_BASE_URL)
    return _client


def embed_texts(texts: list[str], input_type: str = "passage") -> list[list[float]]:
    """
    Embed a list of text strings using NVIDIA NIM.

    Args:
        texts:      List of text chunks to embed.
        input_type: 'passage' for documents, 'query' for queries.

    Returns:
        List of embedding vectors (list of floats).
    """
    client = _get_client()
    # NIM embedding API supports extra_body for input_type
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
        encoding_format="float",
        extra_body={"input_type": input_type, "truncate": "END"},
    )
    # Sort by index to ensure order matches input
    embeddings = sorted(response.data, key=lambda e: e.index)
    return [e.embedding for e in embeddings]


def embed_query(query: str) -> list[float]:
    """Embed a single query string."""
    return embed_texts([query], input_type="query")[0]


def embed_passages(passages: list[str]) -> list[list[float]]:
    """Embed document passages for storage in vector DB."""
    # Batch in groups of 50 to avoid API limits
    BATCH_SIZE = 50
    all_embeddings = []
    for i in range(0, len(passages), BATCH_SIZE):
        batch = passages[i:i + BATCH_SIZE]
        all_embeddings.extend(embed_texts(batch, input_type="passage"))
    return all_embeddings
