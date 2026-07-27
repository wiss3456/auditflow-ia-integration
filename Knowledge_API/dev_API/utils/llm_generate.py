from groq import APIConnectionError, APITimeoutError, BadRequestError, Groq, RateLimitError
from fastapi import HTTPException
from dotenv import load_dotenv, find_dotenv
import os 
import time
from .logger_setup import logger
import re

load_dotenv(find_dotenv())
key = os.getenv("Grok")
client = Groq(api_key=key)
MODEL = "openai/gpt-oss-20b"
def llm_request(prompt:dict,output_format:dict = None,model=None)-> dict:
    """
    this function is responsable for taking the system prompts and pass it to a LLM and returning a response
    arguments :
        - prompt : system prompt what the model need to perform 
        - key : model api key 

    """
    model = MODEL if model == None else model
    system_prompt = prompt["system"]
    if output_format is not None:
        system_prompt += """

API OUTPUT CONSTRAINTS (these override any conflicting article-count or
article-length instructions above):
- Generate exactly 2 articles.
- Each article content must contain 180 to 250 words.
- Return one strictly valid JSON object matching the supplied schema.
- Escape all quotation marks and line breaks occurring inside JSON strings.
- Never place a closing array bracket after an article's content field.
"""

    kwargs = {
        "model":model ,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": prompt["prompt"]},
        ],
        "temperature": 0.2,
        # GPT-OSS counts reasoning tokens in the completion budget. Low
        # reasoning leaves enough tokens to close the structured JSON.
        "reasoning_effort": "low",
        # The current Groq on-demand tier is limited to 8,000 tokens/minute.
        # Keep enough room for the prompt tokens instead of reserving the
        # previous 8,000 tokens entirely for the completion.
        "max_tokens": 3000,
    }
    # Only adding the response format if it's not None
    if output_format is not None:
        kwargs["response_format"] = output_format

    # Groq requests can occasionally fail because of a temporary network
    # interruption. Retry those transient failures before aborting the whole
    # document-generation pipeline.
    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        try:
            response = client.chat.completions.create(**kwargs)
            break
        except (APIConnectionError, APITimeoutError):
            if attempt == max_attempts:
                raise
            delay_seconds = 2 ** attempt
            logger.warning(
                "Temporary Groq connection failure (attempt %s/%s); retrying in %ss",
                attempt,
                max_attempts,
                delay_seconds,
            )
            time.sleep(delay_seconds)
        except BadRequestError as exc:
            # Groq can occasionally reject a best-effort structured response
            # when the generated JSON does not validate. A fresh low-
            # temperature generation normally resolves that transient output.
            if "json_validate_failed" not in str(exc) or attempt == max_attempts:
                raise
            logger.warning(
                "Groq produced invalid JSON (attempt %s/%s); regenerating",
                attempt,
                max_attempts,
            )
            time.sleep(2)
        except RateLimitError:
            if attempt == max_attempts:
                raise
            logger.warning(
                "Groq TPM limit reached (attempt %s/%s); retrying in 60s",
                attempt,
                max_attempts,
            )
            time.sleep(60)

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
