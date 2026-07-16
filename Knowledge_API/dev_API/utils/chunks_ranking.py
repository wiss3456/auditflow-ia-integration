from ..utils.logger_setup import logger
import numpy as np 
from rank_bm25 import BM25Okapi


def rank_chunks(model,
    chunks:list[dict],
    q_reform:str,
    top_k:int)-> list[dict]:

    """
    Hybrid ranking engine combining BM25 and embedding similarity
    via Reciprocal Rank Fusion (RRF) to retrieve the most relevant chunks.

    Args:
        model:   Sentence embedding model (e.g. SentenceTransformer).
        chunks:  Flat list of chunk dicts with at least a 'text' key.
        query:   The reformulated query string for this layer.
        top_k:   Number of top chunks to return after fusion.

    Returns:
        List of top_k chunk dicts ranked by RRF score, each with an added 'rrf_score' key.

    """
    if not chunks:
        logger.error("Chunks list is empty.")
        raise ValueError("Chunks list is empty.")
    
    if not q_reform.strip():
        logger.error("Query is empty.")
        raise ValueError("Query is empty.")


    texts=[c.get("chunk"," ") for c in chunks]

    # --BM25 
    tokenized = [text.lower().split() for text in texts ]
    bm25 = BM25Okapi(tokenized)
    bm25_scores = bm25.get_scores(q_reform.lower().split())
    bm25_ranks = np.argsort(bm25_scores)[::-1]

    # --embedding 
    Document_emb = model.encode(texts,normalize_embeddings=True)
    query_emb = model.encode(q_reform,normalize_embeddings=True)
    emb_scores = np.dot(Document_emb,query_emb.T)
    emb_ranks = np.argsort(emb_scores)[::-1]

    #--RRF Reciprocal Ranking Fusion 
    k = 60 
    rrf_scores: dict[int, float] = {}

    # BM_scores :
    for rank , idx in enumerate(bm25_ranks):
        rrf_scores[idx] = rrf_scores.get(idx, 0.0) + 1/(k + rank)
    
    # Emb_scores :
    for rank , idx in enumerate(emb_ranks):
        rrf_scores[idx] = rrf_scores.get(idx, 0.0) + 1/(k + rank)

    final_ranks = sorted(rrf_scores, key=rrf_scores.get, reverse=True)[:top_k]

    ranked_chunks = []
    for idx in final_ranks:
        chunk=chunks[int(idx)].copy()
        chunk["RRF_score"] = round(rrf_scores[int(idx)],4)
        ranked_chunks.append(chunk)
    
    return ranked_chunks 

    

