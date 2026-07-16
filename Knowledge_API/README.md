# Knowledge API Documentation

## 1. Overview
This API generates a **mission-related knowledge dossier** by performing an end-to-end retrieval-augmented generation (RAG)-like pipeline:
1) expand the mission topic into multiple audit queries,
2) fetch web evidence,
3) clean and chunk text,
4) retrieve relevant chunks using **hybrid retrieval** (BM25 + embedding similarity + RRF),
5) rerank the candidates with a **cross-encoder**,
6) synthesize a structured knowledge base per query “dimension” using an LLM.

### Main use cases
- Generate an internal-audit **knowledge dossier** for a mission topic.
- Regenerate the dossier using cached retrieval results (skip web search/cleaning/chunking).

### High-level architecture
- **FastAPI API layer** exposes endpoints to run the initial pipeline, regenerate, and fetch results.
- **Pipeline layer** orchestrates query expansion, web search, cleaning, chunking, ranking, reranking, and synthesis.
- **Model layer**:
  - Sentence embeddings for semantic/hybrid retrieval.
  - Cross-encoder reranker for final relevance ordering.
  - Groq-hosted LLM for query expansion/reformation and final synthesis.
- **Cache/storage**: JSON files stored under `cache/<mission_id>/`.

### RAG pipeline summary (project-specific)
```txt
Mission topic → Query Expansion → Web Search → Cleaning → Chunking →
Hybrid Retrieval (BM25 + Embedding + RRF) [R1] → Cross-Encoder Reranking [R2] →
Synthesis (LLM with JSON Schema) → Knowledge dossier
```


## 2. Features
- **Query expansion** (LLM-driven)
- **Web document ingestion** (Tavily)
- **Chunking & preprocessing**
  - cleaning (regex-based cleanup of scraped content)
  - word-level overlapping chunks
- **Embedding generation**
  - `SentenceTransformer` embeddings for retrieval
- **Semantic retrieval / hybrid retrieval**
  - BM25 + embedding similarity
  - Reciprocal Rank Fusion (RRF) to combine rankings
- **Reranking**
  - cross-encoder relevance scoring
- **LLM response generation**
  - synthesis per “dimension” using prompt templates + JSON schema
- **Metadata filtering**
  - source URL is carried into each chunk (used as citation/source)
- **Conversation memory**
  - not implemented in this repo (pipeline is mission/topic based)
- **Caching**
  - stores intermediate artifacts per `mission_id` to enable regeneration


## 3. Architecture

### Pipeline Flow
```txt
Input(mission_id, mission_topic)
→ Query expansion (LLM)
→ Web search (Tavily)
→ Cleaning
→ Chunking
→ Hybrid ranking R1 (BM25 + embeddings + RRF)
→ Cross-encoder reranking R2
→ Token evaluation
→ LLM synthesis (structured JSON dossier)
→ cached outputs
```

### Components
- **API Layer**: `dev_API/main.py`
- **Orchestrator**:
  - `dev_API/orchestrater.py`
- **Pipeline modules**:
  - `dev_API/Pipeline/Query_expansion.py`
  - `dev_API/Pipeline/data_collection.py`
  - `dev_API/Pipeline/document_cleaning.py`
  - `dev_API/Pipeline/documents_chunking.py`
  - `dev_API/Pipeline/document_chunks_ranking.py`
  - `dev_API/Pipeline/cross_encoder_Rerank.py`
  - `dev_API/Pipeline/token_evaluation.py`
  - `dev_API/Pipeline/synthese_collection.py`
  - `dev_API/Pipeline/queries_reformation.py`
- **Model Components**
  - Sentence embeddings: `all-MiniLM-L6-v2`
  - Cross-encoder reranker: `cross-encoder/ms-marco-MiniLM-L-6-v2`
  - LLM provider: Groq (prompt-based)
- **Cache Layer**: `dev_API/utils/cache_manager.py`
- **Prompt templates**:
  - `dev_API/prompt/query_expansion.yaml`
  - `dev_API/prompt/queries_reformulation.yaml`
  - `dev_API/prompt/prompt_Synthesis.yaml`


## 4. Tech Stack
- FastAPI
- Uvicorn (ASGI)
- Sentence-Transformers (embeddings + cross-encoder)
- Groq (LLM)
- Tavily (web search)
- Rank-BM25 (BM25)
- tiktoken (token counting)
- YAML prompts (PyYAML)
- dotenv (environment variables)


## 5. Authentication
- API key header: `X-API-Key`
- The server compares it to environment variable `API_key`.

Example header:
```txt
X-API-Key: <your_api_key>
```


## 6. Base URL
This repo uses a standard FastAPI app. When run locally, you typically get:
```txt
http://localhost:8000
```


# Core Endpoints

## 7. Health Check
```http
GET /health
```

Response:
```json
{"status": "ok"}
```


## 8. Initial Document/Knowledge Generation

<img width="6376" height="6134" alt="image" src="https://github.com/user-attachments/assets/8905daee-510a-41c1-9996-8f182b68b009" />

### Create knowledge dossier (full pipeline)
```http
POST /initail_generation
```

#### Request
Query parameters (as implemented):
- `mission_id: str`
- `mission_topic: str`

#### Auth
Required: `X-API-Key` header.

#### Behavior
Runs the full pipeline:
- query expansion
- web search
- cleaning
- chunking
- hybrid retrieval (R1 top_k=200)
- cross-encoder reranking (R2 top_k=50)
- token evaluation
- synthesis (LLM)
- caches intermediate and final results under `cache/<mission_id>/`

#### Response
```json
{
  "knowledge dossier": {
    "<dimension_name>": {
      "summary": "...",
      "articles": [
        {
          "article_id": "...",
          "title": "...",
          "content": "...",
          "citations": ["<url>"]
        }
      ]
    }
  }
}
```

> Note: the exact dimension keys depend on the synthesis prompt template.


## 9. dossier Regeneration Pipeline
### Regenerate dossier using cached retrieval artifacts
<img width="7040" height="5528" alt="image" src="https://github.com/user-attachments/assets/2d5534b5-7f80-4334-8977-2ae8ecc4cbb5" />

```http
POST /regenate_Knowledge
```

#### Request
Query parameters (as implemented):
- `mission_id: str`
- `mission_topic: str`

#### Auth
Required: `X-API-Key` header.

#### Behavior
- Loads cached `chunks_ranked_R1` for the mission.
- Runs query expansion + query reformation again.
- Runs cross-encoder reranking (R2 top_k=30).
- Runs synthesis again.
- store the new knowledge dossier in the Mission_dir

#### Response
```json
{
  "knowledge_dossier": {
    "<dimension_name>": {
      "summary": "...",
      "articles": [
        {
          "article_id": "...",
          "title": "...",
          "content": "...",
          "citations": ["<url>"]
        }
      ]
    }
  }
}
```


## 10. Fetch Generated Knowledge Dossier
```http
GET /get_Knowledge_dossier
```
<img width="6944" height="3328" alt="image" src="https://github.com/user-attachments/assets/e1633f67-b7ad-43b8-9596-52916b5a538b" />



#### Request
Query parameters:
- `mission_id: str`

#### Behavior
Loads cached `knowledge_dossier` from `cache/<mission_id>/knowledge_dossier.json`.

#### Response
```json
{"knowledge_dossier": {"...": "..."}}
```


## 11. Reranking
### Cross-encoder reranking
Implemented in: `dev_API/Pipeline/cross_encoder_Rerank.py`

- For each query dimension:
  - build pairs: `(reformed_query, chunk_text)`
  - `CrossEncoder.predict()` produces a `cross_score`
  - keep top_k chunks (50 during initial generation, 30 during regeneration)

Returned chunk objects contain:
- `chunk`
- `url`
- `cross_score`


## 12. Retrieval Strategy
### Supported retrieval modes (project-specific)
- **Hybrid retrieval** (R1)
  - BM25 ranking (`rank_bm25`)
  - Embedding similarity ranking (`SentenceTransformer.encode` + dot product)
  - Combined via **Reciprocal Rank Fusion (RRF)**

### Ranking logic
- For each dimension query:
  1. compute BM25 scores & ranks
  2. compute embedding similarities & ranks
  3. fuse with RRF:
     - `rrf_score += 1 / (k + rank)` with `k=60`
  4. output top_k ranked chunks

### Reranking logic
- Cross-encoder cross_score ordering, then keep top_k.


## 13. Models

### Embedding models
- Sentence embeddings: `all-MiniLM-L6-v2`
  - loaded at API startup

### Reranker models
- Cross-encoder: `cross-encoder/ms-marco-MiniLM-L-6-v2`

### LLM models (prompt + JSON schema synthesis)
- LLM provider: Groq
- Model (default in code): `meta-llama/llama-4-scout-17b-16e-instruct`
- Uses response format JSON schema when synthesizing the dossier.


## 14. Data Schema

### Document ingestion result (web search)
From Tavily, stored in memory during runtime and then chunked.
Each returned document dict typically includes:
- `url`
- `title`
- `content`
- `raw_content` (because `include_raw_content=True`)

### Chunk schema
Chunks are dicts created by `utils/chunk_document.py` with fields:
- `chunk_id`: `doc{doc_id}_{chunk_id}`
- `doc_id`: int
- `url`: source URL
- `chunk`: chunk text

During ranking:
- Hybrid stage adds: `RRF_score`
- Cross-encoder adds: `cross_score`

### Knowledge dossier schema
Synthesized by LLM in `dev_API/Pipeline/synthese_collection.py`.
The enforced JSON schema is:
- top-level object:
  - `summary: string`
  - `articles: array` of:
    - `article_id: string`
    - `title: string`
    - `content: string`
    - `citations: array<string>`


## 15. Error Handling
Common errors are raised as HTTPException or Python exceptions depending on the endpoint.
Examples:
- invalid API key → `403` with `Invalid API Key`
- model not loaded (startup failed) → `503`
- missing cached chunks in regeneration → `402`

Token-length behavior:
- LLM request warns on `finish_reason == "length"` (hit max_tokens)


## 16. Performance & Limits
- Chunking parameters (word-level):
  - `chunk_size=250` words
  - `overlap=90` words
- Retrieval:
  - R1 top_k=200 (initial generation)
  - R2 top_k=50 (initial generation)
  - R2 top_k=30 (regeneration)
- Cross-encoder batching:
  - `BATCH_SIZE=16`
- LLM:
  - `max_tokens=8000`


## 17. Observability
- Logging is configured in `dev_API/utils/logger_setup.py`
- Each pipeline stage logs start/end and progress.

No dedicated metrics dashboard is wired in the codebase.


## 18. Deployment
### Run locally
Typical usage:
```bash
uvicorn dev_API.main:app --reload --port 8000
```

### Environment variables
Expected variables (from code):
- `API_key` (used by FastAPI auth)
- `Tavily_APIKEY` (web search)
- `Grok` (Groq LLM key)


## 19. Security
- API key protected endpoints via `X-API-Key`.
- Prompt injection mitigation:
  - Not explicitly implemented beyond prompt design and structured JSON schema.


## 20. Example Workflows

### Ingest → Search → fetch (mission dossier)
1. `POST /initail_generation?mission_id=...&mission_topic=...`
2. Poll/store the returned `Mission_id`
3.  call `GET /get_Knowledge_dossier?mission_id=...` to get the Mission id 

### Regenerate the knowledge dossier
1. `POST /regenate_Knowledge?mission_id=...&mission_topic=...`


## 21. Future Improvements
- Streaming LLM responses
- A real `/search` or `/chat` semantic endpoint (currently the API is mission/topic oriented)
- Persistent vector database (current version relies on cached retrieval artifacts, not a vector DB)
- Dedicated observability (metrics, tracing, structured logs)
- Add stronger input validation via Pydantic request models (endpoints currently use function parameters)

