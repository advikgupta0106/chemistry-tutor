const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

export type PubChemProperties = {
  cid: number;
  name: string;
  formula: string;
  molarMass: number;
  iupacName: string;
};

// Rough check for "this looks like a molecular formula" (e.g. "C2H5OH",
// "H2O", "NaCl") vs. a name or a plain-English description — used to decide
// whether a failed name lookup is worth retrying against PubChem's formula
// endpoint at all.
function looksLikeFormula(query: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(query.replace(/\s+/g, ""));
}

async function tryFetchCid(url: string): Promise<number | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const cid = data?.IdentifierList?.CID?.[0];
    return typeof cid === "number" ? cid : null;
  } catch {
    return null;
  }
}

// Tries a name lookup first (covers common names like "aspirin"), then a
// formula lookup if the query looks formula-shaped and the name lookup
// didn't match. Returns null if PubChem has nothing for this query at all —
// callers fall back to the AI /identify-molecule endpoint in that case.
export async function lookupPubChemCid(query: string): Promise<number | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const byName = await tryFetchCid(
    `${PUBCHEM_BASE}/compound/name/${encodeURIComponent(trimmed)}/cids/JSON`
  );
  if (byName) return byName;

  if (looksLikeFormula(trimmed)) {
    const byFormula = await tryFetchCid(
      `${PUBCHEM_BASE}/compound/fastformula/${encodeURIComponent(trimmed)}/cids/JSON`
    );
    if (byFormula) return byFormula;
  }

  return null;
}

export async function fetchPubChemProperties(cid: number): Promise<PubChemProperties | null> {
  try {
    const res = await fetch(
      `${PUBCHEM_BASE}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,Title/JSON`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const props = data?.PropertyTable?.Properties?.[0];
    if (!props) return null;
    return {
      cid,
      name: props.Title ?? `CID ${cid}`,
      formula: props.MolecularFormula ?? "",
      molarMass: parseFloat(props.MolecularWeight) || 0,
      iupacName: props.IUPACName ?? "",
    };
  } catch {
    return null;
  }
}
