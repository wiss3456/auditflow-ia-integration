from tavily import TavilyClient
from dotenv import load_dotenv, find_dotenv 
import os 
load_dotenv(find_dotenv())
key = os.getenv('Tavily_APIKEY')

def search_web(query,max_results=30):
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

    Tav_client = TavilyClient(api_key=key)
    response = Tav_client.search(
        query=query,
        search_depth="advanced",
        max_results=max_results,
        include_domains = None,
        include_raw_content=True,
        include_answer=True ,
        exclude_domains=  [
        "pinterest.com",
        "facebook.com",
        "twitter.com",
        "reddit.com",
        "linkedin.com"
        ]
    )

    if response is None :
        raise ValueError('the Response is None')
    
    return response.get("results", [])