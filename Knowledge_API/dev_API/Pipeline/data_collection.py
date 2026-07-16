from ..utils.web_search import search_web 
from datetime import datetime as dt
from pathlib import Path
import json
from  tqdm import tqdm
from ..utils.logger_setup import logger
from ..utils.cache_manager import save_cache

def getting_documents(mission_id,queries:dict):
    """
    """

    logger.info(f"task_2 : Documents gathering | queries:{len(queries.keys())}")

    if not queries :
        logger.error("the Queries dict is empty")
        raise ValueError("the Queries dict is empty")
    
    if not isinstance(queries, dict) :
        logger.error("the Queries are not a dict")
        raise TypeError("the Queries are not a dict")
    
    documents_store = {}

    for query_id, search_query in tqdm(queries.items(), desc="Collecting Knowledge",unit="query") :
        logger.info(f"search for {query_id}")
        documents_store[query_id] = search_web(search_query)
    
    
    logger.info("task_2 : Documents gathering ended successefully")
    return documents_store
    


