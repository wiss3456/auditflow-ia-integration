from ..utils.cleaning_text import clean_raw_text
from ..utils.cache_manager import save_cache
import json
from tqdm import tqdm
from pathlib import Path 
from ..utils.logger_setup import logger
from datetime import datetime as dt

def clean_documents(mission_id:str,store_documents:dict):
    """
    takes each websearch query documents (results) and clean the text content 
    """
    logger.info('task_3 : Documents cleaning started')

    if not isinstance(store_documents,dict):
        logger.error("The store documents is not a dict")
        raise ValueError("The store documents is not a dict")
    
    for q, documents in tqdm(store_documents.items(), desc = "Cleaning Documents text ...",unit="query"):
        tqdm.write(f"Cleaning Documents of Query : {q}")
        logger.info(f"Cleaning Documents for query {q}")

        if not isinstance(documents,list):
            logger.error("the document must be a list")
            raise ValueError("the document must be a list")
    
        for doc in documents:
            doc['content'] = clean_raw_text(doc.get('content', ""))
            doc['raw_content'] = clean_raw_text(doc.get('raw_content', ""))

    
    logger.info("Document cleaning completed")
    
    return store_documents
