
from dotenv import load_dotenv, find_dotenv
import sys
import os
from ..utils.prompt_loader import load_prompt
from ..utils.llm_generate import llm_request
import json
from ..utils.logger_setup import logger
from datetime import datetime

def reformulate_queries(mission_topic:str, queries:dict,prompt_key:str)->dict:
    """
    Reformulates a structured dict of audit queries into semantically dense
    type-descriptor paragraphs optimized for hybrid BM25 + semantic ranking.

    Each of the 7 dimension queries is rewritten into a short dense paragraph
    describing the KIND of information a relevant document would contain,
    used as a ranking reference in the document retrieval pipeline.

    Args:
        queries (dict):   Structured dict with mission_topic and 7 dimension
                    queries as produced by the query expansion step.
        key (str):        Groq API key used to authenticate the LLM request.
        prompt_key (str): Key to fetch the prompt template from the prompt catalog.

    Returns:
        dict: Same structure as input with expanded type-descriptor paragraphs
                    under "expanded_queries" replacing the original queries.
    Raises:
        ValueError: If any arg is None, empty, wrong type, or missing required keys.
        GroqError:  If the Groq API returns an auth, rate limit, or server error.
    """

    logger.info("task_1 : Query Reformation started")

    prompt = load_prompt(prompt_key)
    if prompt is None :
        logger.error("the prompt is empty")
        raise ValueError("the prompt is empty")
    
    final_prompt = prompt["prompt"].format(queries=queries,mission_topic=mission_topic)
    if final_prompt is None :
        logger.error("the final prompt is empty")
        raise ValueError("the final prompt is empty")

    prompt_dict = {
        "system": prompt["system"],
        "prompt": final_prompt
    }
    responses = llm_request(prompt_dict)
    if responses is None :
        logger.error("the Query dict is empty")
        raise ValueError("the Query dict is empty")
        
    logger.info("the Queries Reformation process is successeful")
    results = json.loads(responses)
    return results

# queries = {'context_and_definition': 'definition and scope of purchase-to-pay cycle internal controls audit',
#     'causes': 'root causes of purchase-to-pay cycle internal control failures and risk factors',
#     'controls': 'internal controls and mitigation strategies for purchase-to-pay cycle',
#     'regularisation': 'laws and regulations governing purchase-to-pay cycle internal controls',
#     'best_practices': 'industry best practices and standards for purchase-to-pay cycle internal controls',
#     'benchmarking': 'KPIs and performance indicators for evaluating purchase-to-pay cycle internal controls effectiveness',
#     'real_incidents': 'real cases and audit findings of purchase-to-pay cycle internal control weaknesses and failures'
#     }
# mission_topic = "Audit of Internal Controls over the Purchase-to-Pay Cycle"
# print(queries_reformulate(mission_topic,queries,"queries_reformulation"))
