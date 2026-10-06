#!/usr/bin/env python3
"""Audita tamaño de módulos frontend.

Uso:
    python scripts/check_frontend_sizes.py
    python scripts/check_frontend_sizes.py --strict

Por defecto informa deuda. --strict devuelve error si encuentra archivos
frontend sobre el límite.
"""

from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND_ROOTS = (
    ROOT / "static" / "css",
    ROOT / "static" / "js",
    ROOT / "templates",
)
EXTENSIONS = {".css", ".js", ".html"}
DEFAULT_LIMIT = 100


def iter_frontend_files():
    for root in FRONTEND_ROOTS:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.is_file() and path.suffix in EXTENSIONS:
                yield path


def line_count(path: Path) -> int:
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        return sum(1 for _ in handle)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT)
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()

    rows = []
    for path in iter_frontend_files():
        count = line_count(path)
        if count > args.limit:
            rows.append((count, path.relative_to(ROOT)))

    rows.sort(reverse=True)

    if not rows:
        print(f"OK: ningún archivo frontend supera {args.limit} líneas.")
        return 0

    print(f"Archivos sobre {args.limit} líneas: {len(rows)}")
    for count, path in rows:
        print(f"{count:5d}  {path}")

    print("\nObjetivo: dividir por responsabilidad canónica, no minificar para ocultar tamaño.")
    return 1 if args.strict else 0


if __name__ == "__main__":
    raise SystemExit(main())
