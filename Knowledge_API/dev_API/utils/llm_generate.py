from groq import Groq
from fastapi import HTTPException
from dotenv import load_dotenv, find_dotenv
import os 
from .logger_setup import logger
import re

load_dotenv(find_dotenv())
key = os.getenv("Grok")
client = Groq(api_key=key)
MODEL = "meta-llama/llama-4-scout-17b-16e-instruct" 
def llm_request(prompt:dict,output_format:dict = None,model=None)-> dict:
    """
    this function is responsable for taking the system prompts and pass it to a LLM and returning a response
    arguments :
        - prompt : system prompt what the model need to perform 
        - key : model api key 

    """
    model = MODEL if model == None else model
    kwargs = {
        "model":model ,
        "messages": [
            {"role": "system", "content": prompt["system"]},
            {"role": "user",   "content": prompt["prompt"]},
        ],
        "temperature": 0.5,
        "max_tokens": 8000,
    }
    # Only adding the response format if it's not None
    if output_format is not None:
        kwargs["response_format"] = output_format

    response = client.chat.completions.create(**kwargs)

    # checking if the tokens are expired
    finish_reason = response.choices[0].finish_reason
    if finish_reason == "length":
        logger.warning("Response truncated — hit max_tokens limit")
    
    raw = response.choices[0].message.content.strip()
    # checking if the response is empty
    if not raw or not raw.strip():
        raise HTTPException(
            status_code=503,
            detail="Response is empty or only contains whitespace")

    return raw.strip()
