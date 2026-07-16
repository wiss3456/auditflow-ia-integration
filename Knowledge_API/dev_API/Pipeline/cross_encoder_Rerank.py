from ..utils.logger_setup import logger
from ..utils.cache_manager import save_cache
from datetime import datetime as dt

def cross_encoder_rerank(
    mission_id:str,
    chunks_store: dict[str, list],
    queries_refom: dict[str, str],
    encoder_model,
    top_k: int ,
    BATCH_SIZE: int = 16) -> dict[str, list]:

    """
    Rerank chunks using a cross-encoder and return top_k most relevant ones.

    Args:
        chunks: list of chunk dicts
        query: string (layer-specific query)
        top_k: number of chunks to keep
        batch_size: batch size for inference

    Returns:
        List of top_k chunks sorted by relevance score
    """



    # if not isinstance(chunks_store,dict):
        # logger.error("the chunks_store must be a dict")
        # raise ValueError("the chunks_store must be a dict")

    if not chunks_store:
        logger.error("chunks_store dict is empty")
        raise ValueError("the chunks_store dict is empty")

    if not isinstance(queries_refom,dict):
        logger.error("the queries must be a dict")
        raise ValueError("the the queries must be a dict")

    if not queries_refom:
        logger.error("queries store is empty")
        raise ValueError("the the queries is empty")

    if not encoder_model:
        logger.error("the model does not exist")
        raise ValueError("the model does not exist")


    for q in queries_refom.keys():
        chunks = chunks_store[q]
        ref_query = queries_refom[q]

        # preparing pairs of (query,text)
        pairs = [(ref_query, chunk['chunk']) for chunk in chunks]

        # predict the relevance_score 
        scores = encoder_model.predict(
            pairs,
            batch_size=BATCH_SIZE,
            show_progress_bar=True
        )

        # attach the score to the chunks 
        for chunk , score in zip(chunks,scores):
            chunk['cross_score'] = float(score)

        #sort chunks by score descending
        ranked_chunks = sorted(
            chunks,
            key=lambda x : x["cross_score"],
            reverse=True 
        )
        
        if not ranked_chunks:
            logger.error(f"Ranked chunks for '{q}' are empty after reranking")
            raise ValueError(f"Ranked chunks for '{q}' are empty after reranking")
        
        logger.info(f"chunks for {q} are reranked successfully")
        chunks_store[q] = ranked_chunks[:top_k]
    save_cache(mission_id,"Ranked_chunks_R2",chunks_store)

    return chunks_store

