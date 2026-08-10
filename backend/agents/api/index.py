"""Vercel Python entrypoint for the Athena agents service.

Vercel's Python runtime discovers a module-level ASGI callable named `app`.
This file lives in `api/`, so the service root (one level up) has to be put on
`sys.path` before `main` can be imported.

All routes are funnelled here by the rewrite rule in `vercel.json`, so the
FastAPI router still sees its original paths (`/chat/stream`, etc.).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import app  # noqa: E402

__all__ = ["app"]
