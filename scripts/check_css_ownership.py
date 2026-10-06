#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = ROOT / "static" / "css"

OWNERS = {
    "hero-home": (re.compile(r"\.hero--home|\.hero-story"), "components/hero-home"),
    "projects": (re.compile(r"#projects|\.panorama-card|\.portfolio-swiper"), "components/projects"),
    "methodology": (re.compile(r"#methodology|\.methodology-"), "components/methodology"),
    "capabilities": (re.compile(r"#services|\.services-|\.feature-card"), "components/capabilities"),
    "profile": (re.compile(r"#about|\.profile-v2"), "components/profile"),
    "cta": (re.compile(r"\.closing-cta"), "components/closing-cta"),
}
SHARED = {
    "base/typography",
    "components/sections",
    "components/motion",
    "pages/home",
    "pages/home-foundation",
}

def allowed(path: Path, owner_dir: str) -> bool:
    rel = path.relative_to(CSS).as_posix()
    return rel.startswith(owner_dir + "/") or any(rel.startswith(x + "/") for x in SHARED)

def main() -> int:
    violations = []
    for path in CSS.rglob("*.css"):
        text = path.read_text(encoding="utf-8", errors="replace")
        for owner, (pattern, owner_dir) in OWNERS.items():
            if pattern.search(text) and not allowed(path, owner_dir):
                rel = path.relative_to(ROOT)
                violations.append((owner, rel))

    if not violations:
        print("OK: propiedad canónica CSS sin violaciones.")
        return 0

    for owner, path in violations:
        print(f"{owner}: selector fuera de ruta canónica -> {path}")
    return 1

if __name__ == "__main__":
    raise SystemExit(main())
