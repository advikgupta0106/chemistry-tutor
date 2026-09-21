// Local copies of PubChem's 3D SDF and 2D PNG for every molecule in
// /content/molecules, downloaded once (see scripts/download-molecule-assets)
// and served from /public/molecules — so viewing one of our 8 curated
// molecules never depends on PubChem being reachable at runtime, and never
// contributes to the ~10-requests-at-once burst that was tripping
// PubChem's rate limit on the molecule page.
export function localMolecule2DUrl(id: string): string {
  return `/molecules/${id}.png`;
}

export function localMoleculeSdfUrl(id: string): string {
  return `/molecules/${id}.sdf`;
}
