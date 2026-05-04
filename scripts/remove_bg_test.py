#!/usr/bin/env python3
"""Quick test on 3 images before running the full batch."""

import json
from pathlib import Path
import requests
from rembg import remove, new_session
from PIL import Image
import io

ROOT_DIR = Path(__file__).parent.parent
DATA_FILE = ROOT_DIR / "src" / "data" / "nendoroids.json"
OUTPUT_DIR = ROOT_DIR / "public" / "images"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

with open(DATA_FILE) as f:
    nendoroids = json.load(f)

items = [n for n in nendoroids if n.get("image")][:3]

print("Loading model...")
session = new_session("u2net")
print("Ready.\n")

for nendo in items:
    nendo_id = nendo.get("id", nendo.get("number"))
    print(f"Processing #{nendo_id} — {nendo['name']}...")
    r = requests.get(nendo["image"], timeout=15, headers={"User-Agent": "Mozilla/5.0"})
    result = remove(r.content, session=session)
    img = Image.open(io.BytesIO(result)).convert("RGBA")
    out = OUTPUT_DIR / f"{nendo_id}_test.png"
    img.save(out)
    print(f"  Saved: {out}")

print("\nTest done — check public/images/ for results.")
