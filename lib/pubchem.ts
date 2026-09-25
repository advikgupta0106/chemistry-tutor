import {
  normalizePubChemCacheKey,
  getCachedCid,
  setCachedCid,
  getCachedProperties,
  setCachedProperties,
} from "@/lib/pubchemCache";

const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const PUBCHEM_IMAGE_BASE = "https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi";

const FETCH_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 1000;

export type PubChemProperties = {
  cid: number;
  name: string;
  formula: string;
  molarMass: number;
  iupacName: string;
};

// Every PubChem call in the app resolves to one of these three outcomes,
// not just success/failure — "not found" (a real answer: this molecule
// genuinely isn't in PubChem) and "unavailable" (PubChem's own service is
// overloaded right now, per the diagnosis — a 503 PUGREST.ServerBusy or a
// 429) need different UI treatment, so callers must be able to tell them
// apart rather than collapsing both into null.
export type PubChemResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_found" }
  | { status: "unavailable" };

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      resolve();
    }, { once: true });
  });
}

// PubChem always sends a plain integer number of seconds here in
// practice, never the HTTP-date form — falls through to the exponential
// schedule below if it's ever anything unparseable.
function retryAfterMs(res: Response): number | null {
  const header = res.headers.get("retry-after");
  if (!header) return null;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : null;
}

// The single low-level primitive every PubChem request in the app goes
// through. Retries a 503 (ServerBusy — PubChem's own load shedding) or
// 429 (rate limited) up to MAX_RETRIES times, honoring Retry-After when
// PubChem sends one and otherwise backing off exponentially from
// BASE_BACKOFF_MS (~1s, ~2s). A 404 means the specific query/CID genuinely
// doesn't exist and is never retried. Every attempt is capped at
// FETCH_TIMEOUT_MS so a hanging request fails into the same retry path
// instead of leaving a caller's spinner running indefinitely.
async function fetchPubChemWithRetry(
  url: string,
  externalSignal?: AbortSignal
): Promise<PubChemResult<Response>> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (externalSignal?.aborted) return { status: "unavailable" };

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), FETCH_TIMEOUT_MS);
    const signal = externalSignal
      ? AbortSignal.any([externalSignal, timeoutController.signal])
      : timeoutController.signal;

    try {
      const res = await fetch(url, { signal });
      clearTimeout(timeoutId);

      if (res.ok) return { status: "ok", data: res };
      if (res.status === 404) return { status: "not_found" };

      if ((res.status === 503 || res.status === 429) && attempt < MAX_RETRIES) {
        const wait = retryAfterMs(res) ?? BASE_BACKOFF_MS * 2 ** attempt;
        await sleep(wait, externalSignal);
        continue;
      }
      return { status: "unavailable" };
    } catch {
      clearTimeout(timeoutId);
      if (externalSignal?.aborted) return { status: "unavailable" };
      if (attempt < MAX_RETRIES) {
        await sleep(BASE_BACKOFF_MS * 2 ** attempt, externalSignal);
        continue;
      }
      return { status: "unavailable" };
    }
  }
  return { status: "unavailable" };
}

// A real chemical formula is shaped like alternating element symbols —
// one uppercase letter, an optional lowercase letter, an optional digit
// run ("H2O", "NaCl", "C6H8O7", "CH3COOH"). Checking only "all letters and
// digits" (the previous version of this check) matches almost any plain
// word or phrase too, once whitespace is stripped — "Citric acid" passes
// that just as easily as a real formula — so it barely skipped anything.
// This is what lets a name search actually skip the fastformula fallback
// call instead of firing a second, doomed-to-miss PubChem request.
function looksLikeFormula(query: string): boolean {
  const compact = query.replace(/\s+/g, "");
  return /^([A-Z][a-z]?\d*)+$/.test(compact);
}

async function fetchCid(url: string, signal?: AbortSignal): Promise<PubChemResult<number>> {
  const result = await fetchPubChemWithRetry(url, signal);
  if (result.status !== "ok") return result;
  try {
    const data = await result.data.json();
    const cid = data?.IdentifierList?.CID?.[0];
    return typeof cid === "number" ? { status: "ok", data: cid } : { status: "not_found" };
  } catch {
    return { status: "unavailable" };
  }
}

// Tries a name lookup first (covers common names like "aspirin"), then a
// formula lookup if the query looks formula-shaped and the name lookup
// didn't match. Checks the local cache before either call, and caches a
// successful result under the query as typed.
export async function lookupPubChemCid(
  query: string,
  signal?: AbortSignal
): Promise<PubChemResult<number>> {
  const trimmed = query.trim();
  if (!trimmed) return { status: "not_found" };

  const cacheKey = normalizePubChemCacheKey(trimmed);
  const cached = getCachedCid(cacheKey);
  if (cached != null) return { status: "ok", data: cached };

  const byName = await fetchCid(
    `${PUBCHEM_BASE}/compound/name/${encodeURIComponent(trimmed)}/cids/JSON`,
    signal
  );
  if (byName.status === "ok") {
    setCachedCid(cacheKey, byName.data);
    return byName;
  }
  if (byName.status === "unavailable") return byName;

  if (looksLikeFormula(trimmed)) {
    const byFormula = await fetchCid(
      `${PUBCHEM_BASE}/compound/fastformula/${encodeURIComponent(trimmed)}/cids/JSON`,
      signal
    );
    if (byFormula.status === "ok") {
      setCachedCid(cacheKey, byFormula.data);
      return byFormula;
    }
    if (byFormula.status === "unavailable") return byFormula;
  }

  return { status: "not_found" };
}

export async function fetchPubChemProperties(
  cid: number,
  signal?: AbortSignal
): Promise<PubChemResult<PubChemProperties>> {
  const cached = getCachedProperties(cid);
  if (cached) return { status: "ok", data: cached };

  const result = await fetchPubChemWithRetry(
    `${PUBCHEM_BASE}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,Title/JSON`,
    signal
  );
  if (result.status !== "ok") return result;

  try {
    const data = await result.data.json();
    const props = data?.PropertyTable?.Properties?.[0];
    if (!props) return { status: "not_found" };
    const parsed: PubChemProperties = {
      cid,
      name: props.Title ?? `CID ${cid}`,
      formula: props.MolecularFormula ?? "",
      molarMass: parseFloat(props.MolecularWeight) || 0,
      iupacName: props.IUPACName ?? "",
    };
    setCachedProperties(cid, parsed);
    return { status: "ok", data: parsed };
  } catch {
    return { status: "unavailable" };
  }
}

// The 3D structure for a molecule that isn't one of the 8 curated/local
// ones (an AI-search result). Not cached — a full SDF is large enough
// that caching it in localStorage isn't worth the quota it'd use, unlike
// the small CID/properties responses above.
export async function fetchPubChemSdf(
  cid: number,
  signal?: AbortSignal
): Promise<PubChemResult<string>> {
  const result = await fetchPubChemWithRetry(
    `${PUBCHEM_BASE}/compound/cid/${cid}/SDF?record_type=3d`,
    signal
  );
  if (result.status !== "ok") return result;
  try {
    return { status: "ok", data: await result.data.text() };
  } catch {
    return { status: "unavailable" };
  }
}

// The 2D structure image, fetched (rather than used directly as an <img
// src>) specifically so it goes through the same retry/timeout handling
// as every other PubChem call — an <img> tag has no way to retry a
// transient failure on its own.
export async function fetchPubChem2DImageBlob(
  cid: number,
  signal?: AbortSignal
): Promise<PubChemResult<Blob>> {
  const result = await fetchPubChemWithRetry(`${PUBCHEM_IMAGE_BASE}?cid=${cid}&t=l`, signal);
  if (result.status !== "ok") return result;
  try {
    return { status: "ok", data: await result.data.blob() };
  } catch {
    return { status: "unavailable" };
  }
}
