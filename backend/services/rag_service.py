"""
RAG Service — ChromaDB + NVIDIA NIM Embeddings
================================================
Ingests battery maintenance documents into ChromaDB
and retrieves relevant context for AI recommendations.
"""
import os
import glob
import chromadb
from chromadb import Collection
from chromadb.config import Settings

from services.embeddings import embed_passages, embed_query

CHROMA_PERSIST_DIR  = os.getenv("CHROMA_PERSIST_DIR",
    os.path.join(os.path.dirname(__file__), '..', 'chroma_db'))
COLLECTION_NAME     = "battery_knowledge_base"
KNOWLEDGE_BASE_DIR  = os.path.join(os.path.dirname(__file__), '..', 'knowledge_base')
CHUNK_SIZE          = 800   # characters per chunk
CHUNK_OVERLAP       = 150   # character overlap between chunks
TOP_K_DEFAULT       = 4

_chroma_client: chromadb.ClientAPI | None = None
_collection: Collection | None = None


def _get_client() -> chromadb.ClientAPI:
    global _chroma_client
    if _chroma_client is None:
        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    return _chroma_client


def get_collection(create_if_missing: bool = True) -> Collection | None:
    global _collection
    if _collection is None:
        client = _get_client()
        existing = [c.name for c in client.list_collections()]
        if COLLECTION_NAME in existing:
            _collection = client.get_collection(
                name=COLLECTION_NAME,
                embedding_function=None   # we provide embeddings manually
            )
        elif create_if_missing:
            _collection = client.create_collection(
                name=COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
                embedding_function=None
            )
    return _collection


def _chunk_text(text: str, source: str) -> list[dict]:
    """Split text into overlapping chunks."""
    chunks = []
    start  = 0
    idx    = 0
    while start < len(text):
        end  = min(start + CHUNK_SIZE, len(text))
        chunk_text = text[start:end].strip()
        if chunk_text:
            chunks.append({
                'id':     f"{source}__chunk_{idx}",
                'text':   chunk_text,
                'source': source,
                'chunk':  idx,
            })
            idx += 1
        if end >= len(text):
            break
        start = end - CHUNK_OVERLAP
    return chunks


def ingest_knowledge_base() -> dict:
    """
    Read all markdown files from knowledge_base/ directory,
    chunk them, embed via NVIDIA NIM, and store in ChromaDB.

    Returns summary dict with counts.
    """
    collection = get_collection(create_if_missing=True)
    md_files = glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.md"))
    if not md_files:
        raise FileNotFoundError(f"No .md files found in {KNOWLEDGE_BASE_DIR}")

    all_chunks: list[dict] = []
    for fpath in md_files:
        source = os.path.basename(fpath).replace('.md', '')
        with open(fpath, 'r', encoding='utf-8') as f:
            text = f.read()
        chunks = _chunk_text(text, source)
        all_chunks.extend(chunks)
        print(f"[rag_service] Chunked '{source}' -> {len(chunks)} chunks")

    # Check which IDs already exist to avoid duplicates
    existing_ids: set[str] = set()
    if collection.count() > 0:
        existing = collection.get(include=[])
        existing_ids = set(existing['ids'])

    new_chunks = [c for c in all_chunks if c['id'] not in existing_ids]
    if not new_chunks:
        return {'status': 'already_ingested', 'total_chunks': len(all_chunks), 'new_chunks': 0}

    # Embed in batches
    texts = [c['text'] for c in new_chunks]
    embeddings = embed_passages(texts)

    collection.add(
        ids=[c['id'] for c in new_chunks],
        embeddings=embeddings,
        documents=[c['text'] for c in new_chunks],
        metadatas=[{'source': c['source'], 'chunk': c['chunk']} for c in new_chunks],
    )

    print(f"[rag_service] Ingested {len(new_chunks)} new chunks into ChromaDB.")
    return {
        'status': 'ingested',
        'files_processed': len(md_files),
        'total_chunks': len(all_chunks),
        'new_chunks': len(new_chunks),
    }


def retrieve_context(query: str, top_k: int = TOP_K_DEFAULT) -> list[dict]:
    """
    Retrieve the top-K most relevant chunks for a query.

    Returns list of dicts with text, source, and distance.
    """
    collection = get_collection(create_if_missing=False)
    if collection is None or collection.count() == 0:
        return []

    q_embedding = embed_query(query)
    results = collection.query(
        query_embeddings=[q_embedding],
        n_results=min(top_k, collection.count()),
        include=['documents', 'metadatas', 'distances'],
    )

    output = []
    docs      = results['documents'][0]
    metadatas = results['metadatas'][0]
    distances = results['distances'][0]

    for doc, meta, dist in zip(docs, metadatas, distances):
        output.append({
            'text':       doc,
            'source':     meta.get('source', 'unknown'),
            'chunk':      meta.get('chunk', 0),
            'similarity': round(1 - float(dist), 4),   # cosine similarity
        })

    return output


def get_kb_status() -> dict:
    """Return status of the knowledge base collection."""
    collection = get_collection(create_if_missing=False)
    if collection is None:
        return {'status': 'not_initialized', 'chunk_count': 0}
    return {
        'status': 'ready',
        'chunk_count': collection.count(),
        'collection': COLLECTION_NAME,
    }
