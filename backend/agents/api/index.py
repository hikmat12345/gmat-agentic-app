"""Vercel Python entrypoint for the Athena agents service."""

import sys
import traceback
from pathlib import Path
from fastapi import Request
from fastapi.responses import JSONResponse

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    from main import app  # noqa: E402

    @app.api_route("/debug-path", methods=["GET", "POST"])
    async def _debug_path(request: Request):
        return JSONResponse({
            "path": request.url.path,
            "scope_path": request.scope.get("path"),
            "root_path": request.scope.get("root_path"),
            "headers": dict(request.headers),
        })

except Exception as _import_err:
    from fastapi import FastAPI
    _tb = traceback.format_exc()
    app = FastAPI()

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def _import_error_handler(path: str):
        return JSONResponse(
            {"startup_error": str(_import_err), "traceback": _tb},
            status_code=500,
        )

__all__ = ["app"]
