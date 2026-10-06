#!/usr/bin/env python3
from argparse import ArgumentParser
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMG_ROOT = ROOT / "static" / "img"
RASTER = {".png", ".jpg", ".jpeg"}
LIMIT = 300 * 1024

def human(n: int) -> str:
    return f"{n / 1024:.0f} KB" if n < 1024 * 1024 else f"{n / 1024 / 1024:.2f} MB"

def target_width(path: Path) -> int:
    name = path.name.lower()
    if "logo" in name:
        return 512
    if "bg" in name or "fondo" in name:
        return 1600
    return 1400

def optimize(path: Path, apply: bool) -> tuple[int, int | None, Path]:
    before = path.stat().st_size
    target = path.with_suffix(".webp")
    if not apply:
        return before, None, target

    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source)
        max_width = target_width(path)
        if image.width > max_width:
            ratio = max_width / image.width
            image = image.resize(
                (max_width, max(1, round(image.height * ratio))),
                Image.Resampling.LANCZOS,
            )
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.save(target, "WEBP", quality=78, method=6)

    return before, target.stat().st_size, target

def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    candidates = [
        p for p in IMG_ROOT.rglob("*")
        if p.is_file() and p.suffix.lower() in RASTER and p.stat().st_size >= LIMIT
    ]
    for path in sorted(candidates, key=lambda p: p.stat().st_size, reverse=True):
        before, after, target = optimize(path, args.apply)
        if after is None:
            print(f"DRY {human(before):>8} -> {target.relative_to(ROOT)}")
        else:
            saved = 100 * (1 - after / before)
            print(f"{human(before):>8} -> {human(after):>8}  -{saved:5.1f}%  {target.relative_to(ROOT)}")

    if not args.apply:
        print("\nDry run only. Use --apply to create .webp copies; originals are preserved.")

if __name__ == "__main__":
    main()
