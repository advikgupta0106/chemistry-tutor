#!/usr/bin/env python3
"""Generates a local 3D SDF and a 2D PNG for every molecule listed in
scripts/molecules.csv, entirely with RDKit — no PubChem calls at all.

For each SMILES: parse it, add explicit hydrogens, embed 3D coordinates
with ETKDG, optimize the geometry with the MMFF94 force field, and save
the result to /public/molecules/<id>.sdf. Separately, compute 2D
coordinates from the original (no added-H) molecule and render it to
/public/molecules/<id>.png.

Run from the scripts/ virtualenv (see scripts/.venv, created via
`python3 -m venv .venv && source .venv/bin/activate && pip install rdkit`):

    source scripts/.venv/bin/activate
    python3 scripts/generate_molecules.py
"""

import csv
import os
import sys

from rdkit import Chem
from rdkit.Chem import AllChem, Draw

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(REPO_ROOT, "scripts", "molecules.csv")
OUT_DIR = os.path.join(REPO_ROOT, "public", "molecules")

IMAGE_SIZE = (600, 600)
EMBED_SEED = 42  # fixed seed so re-running produces the same conformer


def generate_one(mol_id: str, name: str, smiles: str) -> None:
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"RDKit could not parse SMILES: {smiles!r}")

    # 2D depiction — from the original heavy-atom molecule, not the
    # hydrogen-added one, so the image reads as a normal skeletal
    # structure diagram rather than every hydrogen being drawn out.
    mol_2d = Chem.Mol(mol)
    AllChem.Compute2DCoords(mol_2d)
    png_path = os.path.join(OUT_DIR, f"{mol_id}.png")
    Draw.MolToFile(mol_2d, png_path, size=IMAGE_SIZE)

    # 3D structure for the viewer: explicit hydrogens, ETKDG embedding,
    # MMFF geometry optimization.
    mol_3d = Chem.AddHs(mol)
    params = AllChem.ETKDGv3()
    params.randomSeed = EMBED_SEED
    embed_result = AllChem.EmbedMolecule(mol_3d, params)
    if embed_result != 0:
        # Fall back to random-coordinate embedding for anything ETKDG's
        # distance-geometry approach alone can't place (rare for these
        # small, simple molecules, but cheap to guard against).
        params.useRandomCoords = True
        embed_result = AllChem.EmbedMolecule(mol_3d, params)
        if embed_result != 0:
            raise RuntimeError("3D embedding failed (ETKDG and random-coords fallback both failed)")

    mmff_result = AllChem.MMFFOptimizeMolecule(mol_3d, maxIters=1000)
    if mmff_result == -1:
        raise RuntimeError("MMFF force field parameters unavailable for this molecule")
    if mmff_result == 1:
        print(f"  warning: MMFF optimization did not fully converge for {mol_id}, using best result so far", flush=True)

    mol_3d.SetProp("_Name", name)
    sdf_path = os.path.join(OUT_DIR, f"{mol_id}.sdf")
    writer = Chem.SDWriter(sdf_path)
    writer.write(mol_3d)
    writer.close()


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

    with open(CSV_PATH, newline="") as f:
        rows = list(csv.DictReader(f))

    failures = []
    for row in rows:
        mol_id, name, smiles = row["id"], row["name"], row["smiles"]
        print(f"=== {mol_id} ({name}) ===", flush=True)
        try:
            generate_one(mol_id, name, smiles)
            print("  OK", flush=True)
        except Exception as exc:
            print(f"  FAILED: {exc}", flush=True)
            failures.append((mol_id, str(exc)))

    print("\n=== SUMMARY ===", flush=True)
    for row in rows:
        mid = row["id"]
        failure = next((f for f in failures if f[0] == mid), None)
        print(f"{mid}: {'FAILED - ' + failure[1] if failure else 'ok'}", flush=True)

    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
