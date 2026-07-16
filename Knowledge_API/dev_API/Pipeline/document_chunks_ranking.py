from ..utils.chunks_ranking import rank_chunks
from ..utils.logger_setup import logger
from ..utils.cache_manager import save_cache


def rank_docs_chunks(mission_id,chunks_store:dict[str,list],model,queries_refom:dict,top_k:str)-> dict[str,list]:
    """
    ank documents for each query using the provided model.
    
    Args:
        chunks_store: Dict mapping query -> list of documents
        model: Ranking model instance
        queries_reform: Dict mapping query -> reformulated query
        
    Returns:
        chunks_store with documents ranked by relevance
    """
    if not chunks_store:
        logger.error("chunks dict are empty")
        raise ValueError("the chunks dict are empty")

    if not isinstance(chunks_store,dict):
        logger.error("the documents must be a dict")
        raise ValueError("the documents must be a dict")
    
    if not queries_refom:
        logger.error("queries store is empty")
        raise ValueError("the the queries is empty")

    if not isinstance(queries_refom,dict):
        logger.error("the queries must be a dict")
        raise ValueError("the the queries must be a dict")
    if not model :
        logger.error("the model does not exist")
        raise ValueError("the model does not exist")

    for q in chunks_store.keys():
        q_chunks = chunks_store[q]
        q_refom = queries_refom[q]
        chunks_store[q] = rank_chunks(model,q_chunks,q_refom,top_k)

        logger.info(f'documents for query : {q} is ranked')
    
    save_cache(mission_id,"chunks_ranked_R1",chunks_store)
    
    return chunks_store



