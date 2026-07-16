
def build_prompt(prompt:dict,chunks:list[dict]):
    """
    the build_prompt is a function that mergers a list of chunks with a prompt 
    to feed it to a LLM :
    
    input :
        - prompt (str): a text describing what the LLM should perform , it defines the What , How , and the rules 
        - chunks lst[dict]: a list of chunks 
    
    process : 
        - merge the prompt with the retrivel content by looping over each chunk 
        and extracting the source (URL) and content (str)
    output : 
        - a full txt (str)
    """

    if not prompt :
        raise ValueError("prompt dict must contain 'system_prompt' key")
    if not chunks:
        raise ValueError("chunks list is empty")

    merged_prompt = f"""
    SYSTEM PROMPT:
    {prompt["system_prompt"]}

    RETRIEVED CONTEXT:
    """
    for idx, chunk in enumerate(chunks[:50], 1):
        merged_prompt += f"""
    --- DOCUMENT {idx} ---
    Source: {chunk['url']}
    Content:
    {chunk['chunk']}
    """

    return merged_prompt
