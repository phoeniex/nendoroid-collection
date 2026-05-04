#!/usr/bin/env python3
"""
Download nendoroid images, remove backgrounds with rembg,
save as PNGs, and update nendoroids.json with local paths.
"""

import json
import os
import sys
import requests
from pathlib import Path
from rembg import remove, new_session
from PIL import Image
import io

SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
DATA_FILE = ROOT_DIR / "src" / "data" / "nendoroids.json"
OUTPUT_DIR = ROOT_DIR / "public" / "images"
UPDATED_DATA_FILE = ROOT_DIR / "src" / "data" / "nendoroids.json"

def download_image(url):
    try:
        r = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        r.raise_for_status()
        return r.content
    except Exception as e:
        return None

def process(session, img_bytes):
    result = remove(img_bytes, session=session)
    return result

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(DATA_FILE) as f:
        nendoroids = json.load(f)

    # Filter only items with images
    items = [n for n in nendoroids if n.get("image")]
    total = len(items)
    print(f"Found {total} items with images\n")

    # Load model once
    print("Loading rembg model (downloads ~170MB on first run)...")
    session = new_session("u2net")
    print("Model ready.\n")

    processed = 0
    skipped = 0
    failed = 0

    for i, nendo in enumerate(items):
        nendo_id = nendo.get("id", nendo.get("number", str(i)))
        out_path = OUTPUT_DIR / f"{nendo_id}.png"

        # Skip already processed
        if out_path.exists():
            nendo["image"] = f"/images/{nendo_id}.png"
            skipped += 1
            if (i + 1) % 50 == 0:
                print(f"[{i+1}/{total}] Skipped (already done): {nendo_id}")
            continue

        img_bytes = download_image(nendo["image"])
        if not img_bytes:
            print(f"[{i+1}/{total}] FAILED to download: {nendo_id} — {nendo['image']}")
            failed += 1
            continue

        try:
            result_bytes = process(session, img_bytes)
            img = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
            img.save(out_path, "PNG")
            nendo["image"] = f"/images/{nendo_id}.png"
            processed += 1
            print(f"[{i+1}/{total}] Done: {nendo_id} — {nendo.get('name', '')}")
        except Exception as e:
            print(f"[{i+1}/{total}] FAILED processing: {nendo_id} — {e}")
            failed += 1

    # Save updated JSON
    with open(UPDATED_DATA_FILE, "w") as f:
        json.dump(nendoroids, f, indent=2, ensure_ascii=False)

    print(f"\nDone! Processed: {processed} | Skipped: {skipped} | Failed: {failed}")
    print(f"Images saved to: {OUTPUT_DIR}")
    print(f"JSON updated: {UPDATED_DATA_FILE}")

if __name__ == "__main__":
    main()
