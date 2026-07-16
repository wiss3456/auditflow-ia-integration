import tiktoken 
from ..utils.logger_setup import logger
from datetime import datetime as dt

def evaluation_tokens(chunks_store:dict[str,list],tokenizer=None)->dict:
    """
    Evaluate token count for each query based on its chunks.
    
    Args:
        query_chunks: dict where keys are queries and values are lists of chunk dicts
        tokenizer: optional tokenizer (defaults to simple whitespace split)
    
    Returns:
        dict where each query maps to its total token count
    """
    logger.info("--starting the tokens evaluation process")

    if tokenizer is None :
        enc = tiktoken.get_encoding("cl100k_base")
        tokenize = lambda text: len(enc.encode(text))
    else:
        tokenize = lambda text: len(tokenizer.encode(text))
    
    if not isinstance(chunks_store,dict):
        logger.info("the chunk store must be a dict")
        raise ValueError("the chunk store must be a dict")

    if not chunks_store:
        logger.info("the chunk store dict is empty")
        raise ValueError("the chunk store dict is empty")
    

    tokens_report = {}
    for q,chunks in chunks_store.items():
        chunks_list = [chunk.get('chunk'," ") for chunk in chunks]
        query_tokens = tokenize(q)
        corpus = "_".join(chunks_list)
        chunks_tokens = tokenize(corpus)
        tokens_report[q] = {
            "query_tokens": query_tokens,
            "chunks_tokens": chunks_tokens,
            "total_tokens": query_tokens + chunks_tokens,
            "num_chunks": len(chunks_list)
            }
    
    logger.info(f"Tokens report: {tokens_report}")
    
    return tokens_report






