
import tiktoken


def build_prompt(prompt:dict,chunks:list[dict], max_context_tokens: int = 4000):
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
    encoder = tiktoken.get_encoding("cl100k_base")
    for idx, chunk in enumerate(chunks[:50], 1):
        document = f"""
    --- DOCUMENT {idx} ---
    Source: {chunk['url']}
    Content:
    {chunk['chunk']}
    """
        # The Groq on-demand tier has an 8K TPM limit. Preserve the
        # highest-ranked documents while leaving room for the completion.
        if len(encoder.encode(merged_prompt + document)) > max_context_tokens:
            break
        merged_prompt += document

    return merged_prompt
