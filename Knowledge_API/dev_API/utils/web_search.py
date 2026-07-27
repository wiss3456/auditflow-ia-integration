from tavily import TavilyClient
from dotenv import load_dotenv, find_dotenv 
import time
import os 
from ..utils.logger_setup import logger
load_dotenv(find_dotenv())
key = os.getenv('Tavily_APIKEY')

def search_web(query,max_results=10):
    """
    this function takes a query and search it in the web via an API called 
    tavily , a web search API that returns results 
    args :
        - query (str) : query what are we searching for 
    results :
        - list [dict]
        {
            { "url": .....,
            "title": .....,
            "content": .....,
            "score":........,
            "raw_content":......,
            },
        }
    """
    if query is None :
        raise ValueError('the Query is None')

    if not isinstance(query,str) :
        raise ValueError('the Query is not a sting')

    if not key:
        raise ValueError('Tavily_APIKEY is not configured')

    Tav_client = TavilyClient(api_key=key)
    response = None
    max_attempts = 5
    retry_delays = (5, 10, 20, 30)
    for attempt in range(1, max_attempts + 1):
        try:
            response = Tav_client.search(
                query=query,
                search_depth="advanced" if attempt == 1 else "basic",
                max_results=max_results,
                include_domains=None,
                include_raw_content=True,
                include_answer=True,
                timeout=120,
                exclude_domains=[
                    "pinterest.com",
                    "facebook.com",
                    "twitter.com",
                    "reddit.com",
                    "linkedin.com"
                ]
            )
            break
        except Exception:
            logger.exception(
                "Tavily search attempt %s/%s failed", attempt, max_attempts
            )
            if attempt == max_attempts:
                raise
            delay_seconds = retry_delays[attempt - 1]
            logger.warning("Retrying Tavily in %ss", delay_seconds)
            time.sleep(delay_seconds)

    if response is None :
        raise ValueError('the Response is None')
    
    return response.get("results", [])
