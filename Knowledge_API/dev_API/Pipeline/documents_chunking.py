from ..utils.chunk_document import chunk_document 
from ..utils.cache_manager import save_cache
from ..utils.logger_setup import logger
from tqdm import tqdm
from pathlib import Path
import json


def chunking_documents_store(
    mission_id:str,
    documents_store:dict[str, list[dict]]
    )-> dict[str,list[dict]]:
    """
    """
    if not documents_store:
        logger.error("The documents are empty.")
        raise ValueError("The documents are empty.")

    if not isinstance(documents_store,dict):
        logger.error("The documents must be a dict .")
        raise ValueError("The documents must be a dict .")

    chunks_store = {}
    total_chunks=0
    chunks_count = {}

    for q , documents in tqdm(documents_store.items(),total=len(documents_store), desc="Chunking queries"):
        logger.info(f"chunking documents for query: {q}")

        chunks_store[q] = []
        for i, doc in enumerate(documents):
            doc_chunks = chunk_document(doc,i)
            chunks_store[q].extend(doc_chunks)
            total_chunks += len(doc_chunks)
        chunks_count[q] = total_chunks

    logger.info(f"chunks per Dimension: {chunks_count}")

    save_cache(mission_id,"chunks_store",chunks_store)

    return chunks_store


#testing 
# source_path = "dev_API/files/clean_docs.json"
# with open(source_path,"r",encoding="utf-8") as f:
#     documents = json.load(f)

# chunking_documents_store(documents)


