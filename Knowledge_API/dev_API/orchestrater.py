from pathlib import Path
import json
import time
from sentence_transformers import SentenceTransformer 
from .Pipeline.Query_expansion import expand_queries
from .Pipeline.data_collection import getting_documents 
from .Pipeline.document_cleaning import clean_documents
from .Pipeline.documents_chunking import chunking_documents_store
from .Pipeline.document_chunks_ranking import rank_docs_chunks
from .Pipeline.cross_encoder_Rerank import cross_encoder_rerank
from .Pipeline.queries_reformation import reformulate_queries
from .Pipeline.token_evaluation import evaluation_tokens
from .Pipeline.synthese_collection import synthesis_Knowledge
from .utils.cache_manager import load_cache , get_cache_path
from .utils.logger_setup import logger



def initial_generation_pipeline(mission_id,mission,emb_model,encoder_model)-> dict[str,list]:
    """
    Orchestartes the full pipeline process from the query expansion to the synthesis 
    this the initial generation process where we run the whole process from a to z 

    """
    # #--Query expansion :
    queries = expand_queries(mission,"query_expansion")

    # #--Web search 
    store_documents = getting_documents(mission_id,queries)
    
    #--Documents raw_content and content text cleaning 
    store_documents_v1 = clean_documents(mission_id,store_documents)

    #--Documents chunking
    chunks_store = chunking_documents_store(mission_id,store_documents_v1)

    # #--Queries reformation
    queries_refom = reformulate_queries(mission,queries,prompt_key="queries_reformulation")

    # #--Chunks first level Ranking 
    chunks_store_R1 = rank_docs_chunks(mission_id,chunks_store,emb_model,queries_refom,top_k=200)

    #chunks_store_R1 = load_cache(mission_id,"chunks_ranked_R1")

    # #--Reranking the chunks using the  cross_encoder
    chunks_store_R2 = cross_encoder_rerank(mission_id,chunks_store_R1,queries_refom,encoder_model,top_k=50)

    # Token evaluation 
    tokens_report = evaluation_tokens(chunks_store_R2)

    # synthetising the Knowledge
    knowledge_dossier = synthesis_Knowledge(mission_id,"prompt_Synthesis",chunks_store_R2)

    return knowledge_dossier



def regeneration_pipeline(mission_id,mission,emb_model,encoder_model)-> dict[str,list]:
    """
    orchestrates a partial pipeline that skips the websearch , data cleaning and data processing 
    because the result of that subprocess is already stored when the initial generation pipeline was processed  .
    but the Pipeline is not naive it conly runs if the chunks store relative to the mission is stored in the cache file

    input :
        mission_id (str) : unique id of the mission 
        mission (str) : mission_topics 
        emb_model and encoder_model (str) : models used in the ranking process  
    """

    # process

    # loading the chunks 
    chunks_ranked_R1 =  load_cache(mission_id,"chunks_ranked_R1")

    # Queries expansion
    queries = expand_queries(mission,"query_expansion")

    # #--Queries reformation
    queries_refom = reformulate_queries(mission,queries,prompt_key="queries_reformulation")

    # #--Reranking the chunks using the  cross_encoder
    chunks_store_R2 = cross_encoder_rerank(mission_id,chunks_ranked_R1,queries_refom,encoder_model,top_k=30)

    # Token evaluation 
    tokens_report = evaluation_tokens(chunks_store_R2)

    # synthetising the Knowledge
    knowledge_dossier = synthesis_Knowledge(mission_id,"prompt_Synthesis",chunks_store_R2)
    
    return knowledge_dossier


