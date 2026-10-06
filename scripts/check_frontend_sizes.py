#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROOTS = {
    "css": (ROOT / "static" / "css",),
    "js": (ROOT / "static" / "js",),
    "html": (ROOT / "templates",),
    "all": (ROOT / "static" / "css", ROOT / "static" / "js", ROOT / "templates"),
}
EXTENSIONS = {
    "css": {".css"},
    "js": {".js"},
    "html": {".html"},
    "all": {".css", ".js", ".html"},
}

def files(scope: str):
    for root in ROOTS[scope]:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.is_file() and path.suffix in EXTENSIONS[scope]:
                yield path

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", choices=ROOTS, default="all")
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()

    rows = []
    for path in files(args.scope):
        count = sum(1 for _ in path.open("r", encoding="utf-8", errors="replace"))
        if count > args.limit:
            rows.append((count, path.relative_to(ROOT)))

    rows.sort(reverse=True)
    if not rows:
        print(f"OK: {args.scope} <= {args.limit} líneas por archivo.")
        return 0

    print(f"{len(rows)} archivo(s) {args.scope} sobre {args.limit} líneas:")
    for count, path in rows:
        print(f"{count:5d}  {path}")
    return 1 if args.strict else 0

if __name__ == "__main__":
    raise SystemExit(main())
