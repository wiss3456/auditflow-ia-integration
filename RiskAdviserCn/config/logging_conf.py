import logging, json, time

class JSONFormatter(logging.Formatter):
    def format(self, record):
        base = {"ts": time.strftime("%Y-%m-%dT%H:%M:%S"), "level": record.levelname,
                "logger": record.name, "msg": record.getMessage()}
        extra = {k: v for k, v in record.__dict__.items()
                 if k not in logging.LogRecord.__dict__ and not k.startswith("_")
                 and k not in ("msg","args","exc_info","exc_text","stack_info",
                               "levelname","levelno","pathname","filename","module",
                               "funcName","created","msecs","relativeCreated",
                               "thread","threadName","processName","process","name","message","taskName")}
        return json.dumps({**base, **extra}, default=str)


class KwargsLogger(logging.Logger):
    def _log(self, level, msg, args, **kwargs):
        standard = {"exc_info", "stack_info", "stacklevel", "extra"}
        custom = {k: v for k, v in kwargs.items() if k not in standard}
        standard_kwargs = {k: v for k, v in kwargs.items() if k in standard}
        
        extra = standard_kwargs.pop("extra", {}) or {}
        extra.update(custom)
        
        super()._log(level, msg, args, extra=extra, **standard_kwargs)


def get_logger(name: str) -> logging.Logger:
    logging.setLoggerClass(KwargsLogger)
    logger = logging.getLogger(name)
    if not logger.handlers:
        h = logging.StreamHandler()
        h.setFormatter(JSONFormatter())
        logger.addHandler(h)
        logger.setLevel(logging.INFO)
        logger.propagate = False
    return logger