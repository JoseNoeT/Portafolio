#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "static"
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg"}

def human(size: int) -> str:
    units = ["B", "KB", "MB"]
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.2f} {unit}"
        value /= 1024
    return f"{value:.2f} MB"

def main() -> None:
    files = [p for p in STATIC.rglob("*") if p.is_file()]
    images = [p for p in files if p.suffix.lower() in IMAGE_EXT]
    total = sum(p.stat().st_size for p in files)
    image_total = sum(p.stat().st_size for p in images)

    print(f"Static total: {human(total)}")
    print(f"Images:       {human(image_total)} ({len(images)} files)")
    print("\nLargest images:")
    for path in sorted(images, key=lambda p: p.stat().st_size, reverse=True)[:20]:
        print(f"{human(path.stat().st_size):>10}  {path.relative_to(ROOT)}")

    heavy = [p for p in images if p.stat().st_size >= 500 * 1024]
    print(f"\nImages >= 500 KB: {len(heavy)}")
    if heavy:
        print("Target: backgrounds <= 250 KB; logos <= 100 KB; cards <= 180 KB.")

if __name__ == "__main__":
    main()
