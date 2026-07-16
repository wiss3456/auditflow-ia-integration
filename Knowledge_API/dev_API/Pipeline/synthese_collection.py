from ..utils.prompt_loader import load_prompt 
from ..utils.cache_manager import save_cache ,load_cache
from ..utils.llm_generate import llm_request 
from ..utils.prompt_builder import build_prompt
from ..utils.logger_setup import logger
from fastapi import HTTPException
from pathlib import Path
import time
import os
import json
from tqdm import tqdm


def synthesis_Knowledge(mission_id:str,prompt_key:str,chunks_store:dict[str,list])-> dict[str,list]:
    """
    this is the final layer of the pipeline where this function turns the Top chunks for each layer into a 
    structured articles following a prompt that defines 
        - the synthesis objectives
        - output philosophy
        - article structure
        - behavioral constraints
    
    Process : 
    for each layer :
        -  load the relative prompt 
        -  built the full prompt : prompt + chunks 
        - passing the full prompt to the LLM 
        - appending the article dossier in a Knowledge_dossier 
        - storing the Knowledge_dossier in a json file 

    """
    knowledge_dossier = {}
    
    # Output Format
    DOSSIER_SCHEMA = {
        "type": "json_schema",
        "json_schema": {
            "name": "knowledge_dossier_layer",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "articles": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "article_id": {"type": "string"},
                                "title":      {"type": "string"},
                                "content":    {"type": "string"},
                                "citations": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                }
                            },
                            "required": ["article_id", "title", "content", "citations"],
                            "additionalProperties": False
                        }
                    }
                },
                "required": ["summary", "articles"],
                "additionalProperties": False
            }
        }
    }

    # loading the prompt catalogue 
    prompt = load_prompt("prompt_Synthesis")

    # checking if the catalogue is not empty
    if not prompt:
        raise HTTPException(
            detail="the prompt catalogue is empty ",
            status_code=404
        )

    layers_prompt = prompt['layers']

    # checking if the chunks are empty 
    if not chunks_store:
        raise HTTPException(
            detail="the prompt catalogue is empty ",
            status_code=404
        )

    for key in tqdm(chunks_store.keys(),desc = "synthesising the knowledge base ..."):
        if key.strip() == "regularisation":
            time.sleep(30)

        logger.info(f"synthesising the knowledge base for {key}")
        full_prompt = {}
        chunks_prompt = build_prompt(layers_prompt[key],chunks_store[key])
        
        full_prompt["system"]=prompt["system"]
        full_prompt["prompt"]=chunks_prompt

        raw_dossier = llm_request(full_prompt,DOSSIER_SCHEMA)
        print(raw_dossier[:200])

        knowledge_dossier[key] = json.loads(raw_dossier)

    # storing the knowledge_dossier

    save_cache(mission_id,"knowledge_dossier",knowledge_dossier)

    return knowledge_dossier
