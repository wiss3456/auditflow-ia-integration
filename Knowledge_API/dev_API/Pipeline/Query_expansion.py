
from dotenv import load_dotenv, find_dotenv
import sys
import os
from ..utils.prompt_loader import load_prompt
from ..utils.llm_generate import llm_request
import json
from ..utils.logger_setup import logger
from datetime import datetime

def expand_queries(mission_topic,prompt_key)-> list[dict]:
    """
    Expands a user query into multiple related queries following a 
    structure .

    This function takes a single query and uses an LLM to generate
    multiple variations of it, improving the chances of finding
    relevant documents in the knowledge base

    Args:
        Mission_topic (str): the topic , subject of the mission ex : fraud in train station paiment gate
        key (str)  : LLM API key 
        prompt_key : a key that fetches the prompt for this task from the prompt catalog a yaml file 
    Returns:
        list[str]: A list of expanded queries with the objectof of query .

    raises :
        ValueError : if one of the args is not in the right type or None or empty
        GroqError : if the tokens are expired or internal server problem
    
    """
    logger.info("task_1 : Query expansion started")

    prompt = load_prompt(prompt_key)
    if prompt is None :
        logger.error("the prompt is empty")
        raise ValueError("the prompt is empty")
    
    final_prompt = prompt["prompt"].format(mission_topic=mission_topic)
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
        
    logger.info("the Queries expansion process is successeful")
    results = json.loads(responses)
    return results['queries']

#print(expand_queries("audit de communication de crise","query_expansion"))