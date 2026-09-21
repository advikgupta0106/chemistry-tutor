#!/usr/bin/env python3
"""Downloads a local 3D SDF (falling back to 2D if unavailable) and a 2D PNG
from PubChem for every molecule in /content/molecules, saving them to
/public/molecules/<id>.sdf and /public/molecules/<id>.png.

Run this once whenever a molecule is added to /content/molecules — the app
itself never calls PubChem for these at runtime once the assets exist (see
lib/moleculeAssets.ts), which is what this script exists to make possible.

Usage: python3 scripts/download_molecule_assets.py
"""

import json
import os
import subprocess
import sys
import time

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(REPO_ROOT, "content", "molecules")
OUT_DIR = os.path.join(REPO_ROOT, "public", "molecules")

# PubChem's own documented limit is ~5 requests/second; this is well under
# that even accounting for the two requests (SDF + PNG) made per molecule.
DELAY_BETWEEN_REQUESTS = 0.3
MAX_ATTEMPTS = 5
BACKOFF_SCHEDULE = [5, 15, 30, 60]  # seconds, used when no Retry-After header


def curl_fetch(url, out_path):
    """Returns (status_code, retry_after_seconds_or_None)."""
    result = subprocess.run(
        [
            "curl", "-s", "-o", out_path,
            "-w", "%{http_code} %{header_json}",
            "--max-time", "30",
            url,
        ],
        capture_output=True, text=True,
    )
    stdout = result.stdout.strip()
    try:
        code_str, header_json = stdout.split(" ", 1)
        code = int(code_str)
        headers = json.loads(header_json)
        retry_after = headers.get("retry-after", [None])[0]
        retry_after = int(retry_after) if retry_after else None
    except Exception:
        code, retry_after = 0, None
    return code, retry_after


def fetch_with_retries(url, out_path, label):
    code = 0
    for attempt in range(MAX_ATTEMPTS):
        code, retry_after = curl_fetch(url, out_path)
        if code == 200 and os.path.getsize(out_path) > 50:
            return True, code
        if attempt < MAX_ATTEMPTS - 1:
            wait = retry_after if retry_after else BACKOFF_SCHEDULE[min(attempt, len(BACKOFF_SCHEDULE) - 1)]
            print(f"  [{label}] attempt {attempt + 1} failed (HTTP {code}), retrying in {wait}s...", flush=True)
            time.sleep(wait)
        else:
            print(f"  [{label}] attempt {attempt + 1} failed (HTTP {code}), giving up", flush=True)
    # curl writes to -o regardless of the response status, so a final
    # failure otherwise leaves PubChem's small error-JSON body sitting at
    # out_path looking like a real asset. Remove it so a failed run never
    # leaves a broken file behind.
    if os.path.exists(out_path):
        os.remove(out_path)
    return False, code


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    molecule_files = sorted(f for f in os.listdir(CONTENT_DIR) if f.endswith(".json"))
    results = {}

    for fname in molecule_files:
        with open(os.path.join(CONTENT_DIR, fname)) as f:
            mol = json.load(f)
        mid = mol["id"]
        cid = mol["pubchem_cid"]
        print(f"=== {mid} (CID {cid}) ===", flush=True)
        results[mid] = {"sdf": None, "png": None}

        sdf_path = os.path.join(OUT_DIR, f"{mid}.sdf")
        sdf_url_3d = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/SDF?record_type=3d"
        ok, _ = fetch_with_retries(sdf_url_3d, sdf_path, f"{mid} SDF 3D")
        if ok:
            results[mid]["sdf"] = "3d"
        else:
            time.sleep(DELAY_BETWEEN_REQUESTS)
            sdf_url_2d = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/SDF?record_type=2d"
            ok2, code2 = fetch_with_retries(sdf_url_2d, sdf_path, f"{mid} SDF 2D fallback")
            results[mid]["sdf"] = "2d" if ok2 else f"FAILED (last HTTP {code2})"

        time.sleep(DELAY_BETWEEN_REQUESTS)

        png_path = os.path.join(OUT_DIR, f"{mid}.png")
        png_url = f"https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid={cid}&t=l"
        ok3, code3 = fetch_with_retries(png_url, png_path, f"{mid} PNG")
        results[mid]["png"] = "ok" if ok3 else f"FAILED (last HTTP {code3})"

        time.sleep(DELAY_BETWEEN_REQUESTS)

    print("\n=== SUMMARY ===", flush=True)
    any_failed = False
    for mid, r in results.items():
        if "FAILED" in str(r["sdf"]) or "FAILED" in str(r["png"]):
            any_failed = True
        print(f"{mid}: sdf={r['sdf']} png={r['png']}", flush=True)

    sys.exit(1 if any_failed else 0)


if __name__ == "__main__":
    main()
