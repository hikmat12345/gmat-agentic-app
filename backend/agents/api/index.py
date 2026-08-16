"""Vercel Python entrypoint for the Athena agents service."""

import sys
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    from main import app  # noqa: E402
except Exception as _import_err:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    _tb = traceback.format_exc()
    app = FastAPI()

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def _import_error_handler(path: str):
        return JSONResponse(
            {"startup_error": str(_import_err), "traceback": _tb},
            status_code=500,
        )

__all__ = ["app"]
