#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = ROOT / "static" / "css"

OWNERS = {
    "hero-home": (re.compile(r"\.hero--home\b|\.hero-story\b"), "components/hero-home"),
    "projects-home": (re.compile(r"#projects\b|\.panorama-card\b|\.portfolio-swiper\b"), "components/projects"),
    "methodology-home": (re.compile(r"#methodology\b|\.methodology-(?:slider|slide|step|story|scene)"), "components/methodology"),
    "capabilities-home": (re.compile(r"#services\b|\.feature-card\b|\.services-(?:story|title-accent|desc-accent)"), "components/capabilities"),
    "profile-home": (re.compile(r"#about\.profile-v2|\.profile-v2"), "components/profile"),
    "cta-home": (re.compile(r"\.closing-cta\b"), "components/closing-cta"),
}

SHARED_PREFIXES = (
    "base/typography/",
    "components/sections/",
    "components/motion/",
    "pages/home/",
    "pages/home-foundation/",
)

ENTRYPOINTS = {
    "components/hero-home.css",
    "components/project-carousel.css",
    "components/methodology-slider.css",
    "components/capabilities.css",
    "components/profile.css",
    "components/closing-cta.css",
    "components/horizontal-rail.css",
    "pages/home.css",
    "pages/home-foundation.css",
}

def allowed(path: Path, owner_dir: str) -> bool:
    rel = path.relative_to(CSS).as_posix()
    if rel in ENTRYPOINTS:
        return True
    if rel.startswith(owner_dir + "/"):
        return True
    return rel.startswith(SHARED_PREFIXES)

def main() -> int:
    violations = []
    for path in CSS.rglob("*.css"):
        text = path.read_text(encoding="utf-8", errors="replace")
        for owner, (pattern, owner_dir) in OWNERS.items():
            if pattern.search(text) and not allowed(path, owner_dir):
                violations.append((owner, path.relative_to(ROOT)))

    if not violations:
        print("OK: propiedad canónica CSS sin violaciones.")
        return 0

    for owner, path in sorted(set(violations)):
        print(f"{owner}: selector fuera de ruta canónica -> {path}")
    return 1

if __name__ == "__main__":
    raise SystemExit(main())
