
def chunk_document(document:dict,
                    doc_id:int,
                    chunk_size=250,
                    overlap=90
    )->list[str]:
    """
        Split a single document's text into overlapping word-level chunks.

    Combines 'content' and 'raw_content' fields as the text source.
    'content' is used first; 'raw_content' is appended if present.

    Args:
        document:   Dict with at least one of 'content' or 'raw_content' keys.
        chunk_size: Number of words per chunk.
        overlap:    Number of words to repeat at the start of the next chunk.

    Returns:
        List of chunk strings.

    Raises:
        ValueError: If document is empty or not a dict.
        ValueError: If overlap >= chunk_size (would cause an infinite loop).


    """

    if not document :
        raise ValueError("the document is empty.")

    if not isinstance(document,dict):
        raise ValueError("the document must be a dict.")
    
    if overlap >= chunk_size:
        raise ValueError("overlap must be less than chunk_size.")



    source = ( 
        document.get('content'," ") + " "
        + document.get('raw_content', "")
    ).strip()

    words = source.split()
    doc_chunks = []
    start = 0
    chunk_id  = 0
    while start < len(words):
        end = start + chunk_size 
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)
        chunk_dict = {
            "chunk_id":f"doc{doc_id}_{chunk_id}",
            "doc_id": doc_id,
            "url":document.get('url'," "),
            "chunk":chunk_text
            }
        doc_chunks.append(chunk_dict,)
        start += chunk_size - overlap 
        chunk_id +=1
    return doc_chunks 




