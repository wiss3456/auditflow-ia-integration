"""
utils/llm_request.py
"""

import json
import re
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from groq import Groq
from config.settings import settings
from config.logging_conf import get_logger

logger = get_logger(__name__)
_client = Groq(api_key=settings.GROQ_API_KEY)

MAX_RETRIES    = 8
MIN_INTERVAL_S = 60.0 / settings.GROQ_REQUESTS_PER_MIN
MAX_WORKERS    = settings.GROQ_MAX_WORKERS


class _TokenBucket:
    def __init__(self, interval_s: float):
        self._interval = interval_s
        self._lock     = threading.Lock()
        self._next_ok  = time.monotonic()

    def acquire(self) -> None:
        with self._lock:
            now           = time.monotonic()
            slot          = max(self._next_ok, now)
            self._next_ok = slot + self._interval
            wait          = slot - now
        if wait > 0:
            time.sleep(wait)

    def penalise(self, extra_s: float) -> None:
        with self._lock:
            self._next_ok = max(self._next_ok, time.monotonic() + extra_s)


_bucket = _TokenBucket(MIN_INTERVAL_S)


def _parse_wait(error_str: str) -> float:
    m = re.search(r"try again in ([0-9.]+)s", error_str)
    return float(m.group(1)) + 2.0 if m else 65.0


def _strip_fences(raw: str) -> str:
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()


def _try_repair_json(raw: str):
   
    cut = raw.rfind("},")
    if cut == -1:
        cut = raw.rfind("}")
    if cut == -1:
        return None
    candidate = raw[: cut + 1].strip()
   
    if not candidate.startswith("["):
        candidate = "[" + candidate
    candidate += "]"
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        return None


def llm_request(
    system: str,
    user: str,
    temperature: float = 0.4,
    max_tokens: int = 1200,
) -> list | dict | None:

    for attempt in range(1, MAX_RETRIES + 1):
        _bucket.acquire()
        t0 = time.perf_counter()
        try:
            response = _client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user",   "content": user},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            dt  = round((time.perf_counter() - t0) * 1000)
            raw = _strip_fences(response.choices[0].message.content.strip())

            if not raw:
                logger.warning("llm_request empty response", attempt=attempt)
                continue  

            try:
                result = json.loads(raw)
            except json.JSONDecodeError:
                
                result = _try_repair_json(raw)
                if result is not None:
                    logger.warning("llm_request json_repaired", attempt=attempt)
                else:
                    logger.error("llm_request json_error", attempt=attempt,
                                 preview=raw[:120])
                    continue  

            logger.info("llm_request ok", duration_ms=dt, attempt=attempt)
            return result

        except Exception as e:
            err = str(e)
            if "401" in err:
                logger.error("llm_request 401: clé API invalide — vérifier .env")
                return None
            if "404" in err:
                logger.error("llm_request 404: modèle introuvable — vérifier GROQ_MODEL dans .env")
                return None
            if "429" in err:
                wait = _parse_wait(err)
                logger.warning("llm_request 429: waiting",
                               attempt=attempt, wait_s=round(wait, 1))
                _bucket.penalise(wait)
                time.sleep(wait)
                continue
            if "connection" in err.lower() or "timeout" in err.lower():
                wait = min(10.0 * attempt, 60.0)
                logger.warning("llm_request connection_error",
                               attempt=attempt, wait_s=wait)
                time.sleep(wait)
                continue
            logger.error("llm_request error", attempt=attempt, error=err[:200])
            return None

    logger.error("llm_request: max retries atteint", max_retries=MAX_RETRIES)
    return None


def llm_request_batch(tasks: list[dict]) -> list:
    results = [None] * len(tasks)

    def _run(index: int, task: dict):
        meta   = task.pop("_meta", None)
        result = llm_request(**task)
        if result is not None and meta is not None:
            if isinstance(result, dict):
                result["_meta"] = meta
            elif isinstance(result, list):
                result = {"_meta": meta, "_items": result}
        return index, result

    logger.info("llm_request_batch: start", total=len(tasks), workers=MAX_WORKERS)
    t0 = time.perf_counter()

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(_run, i, dict(t)): i for i, t in enumerate(tasks)}
        done = 0
        for fut in as_completed(futures):
            idx, res = fut.result()
            results[idx] = res
            done += 1
            logger.info("llm_request_batch: progress", done=done, total=len(tasks))

    elapsed   = round(time.perf_counter() - t0, 1)
    succeeded = sum(1 for r in results if r is not None)
    logger.info("llm_request_batch: done",
                succeeded=succeeded,
                failed=len(tasks) - succeeded,
                elapsed_s=elapsed)
    return results