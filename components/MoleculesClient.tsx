"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Sparkles, AlertCircle, Box } from "lucide-react";
import type { Molecule } from "@/lib/content";
import { formatFormula } from "@/lib/formatFormula";
import { lookupPubChemCid } from "@/lib/pubchem";
import { API_URL } from "@/lib/apiUrl";

function pubchem2DImageUrl(cid: number) {
  return `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=${cid}&t=l`;
}

type IdentifyResult = {
  name: string;
  formula: string;
  iupac_name: string;
  molar_mass: string;
  type: string;
  hybridization: string;
  bond_angle: string;
  about: string;
};

type SearchState = "idle" | "loading" | "error";

function findLocalMatch(molecules: Molecule[], query: string): Molecule | undefined {
  const q = query.trim().toLowerCase();
  return molecules.find((m) => m.name.toLowerCase() === q || m.formula.toLowerCase() === q);
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">{label}</p>
      <p className="mt-0.5 text-sm text-text">{value}</p>
    </div>
  );
}

export default function MoleculesClient({ molecules }: { molecules: Molecule[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [loadingMessage, setLoadingMessage] = useState("Searching PubChem…");
  const [errorMessage, setErrorMessage] = useState("");
  const [identifyResult, setIdentifyResult] = useState<IdentifyResult | null>(null);

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIdentifyResult(null);
    setErrorMessage("");

    // 1. Already one of the 8 curated molecules — no network round trip
    // needed at all.
    const localMatch = findLocalMatch(molecules, trimmed);
    if (localMatch) {
      router.push(`/molecule/${localMatch.id}`);
      return;
    }

    setState("loading");
    setLoadingMessage("Searching PubChem…");

    // 2. PubChem, by name or formula, using the student's own query —
    // gives a real 3D structure directly.
    const directCid = await lookupPubChemCid(trimmed);
    if (directCid) {
      router.push(`/molecule/${directCid}`);
      setState("idle");
      return;
    }

    // 3. Not found as-typed (e.g. a plain-English description like "the
    // acid in lemons") — ask Gemini to identify it.
    setLoadingMessage("Identifying molecule…");
    let identified: IdentifyResult;
    try {
      const res = await fetch(`${API_URL}/identify-molecule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? "Couldn't identify that molecule. Try rephrasing your search.");
      }

      identified = await res.json();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Couldn't reach the identifier. Check your connection and try again."
      );
      setState("error");
      return;
    }

    // 4. Gemini often names the real molecule (e.g. "Citric acid") even
    // when the student's original phrasing could never have matched
    // PubChem directly — retry PubChem with the corrected name, then
    // formula, before settling for the info-card-only fallback. This is
    // what makes "no 3D structure available" mean PubChem genuinely
    // doesn't have it, not just that the student's own wording didn't
    // match.
    setLoadingMessage("Confirming 3D structure…");
    const retryCid =
      (await lookupPubChemCid(identified.name)) ?? (await lookupPubChemCid(identified.formula));
    if (retryCid) {
      router.push(`/molecule/${retryCid}`);
      setState("idle");
      return;
    }

    setIdentifyResult(identified);
    setState("idle");
  }

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface"
        >
          <ArrowLeft size={18} strokeWidth={1.5} className="text-text" />
        </Link>
        <h1 className="text-lg font-bold text-text">Molecules</h1>
      </div>
      <p className="mt-2 text-sm text-text-dim">
        Browse the syllabus set, or search any molecule by name, formula, or description.
      </p>

      <div className="relative mt-5">
        <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search any molecule..."
          className="w-full rounded-xl bg-surface py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-dim outline-none"
        />
      </div>

      {state === "loading" && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm text-text-dim">{loadingMessage}</p>
        </div>
      )}

      {state === "error" && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <AlertCircle size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-sm text-text-dim">{errorMessage}</p>
        </div>
      )}

      {identifyResult && (
        <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} strokeWidth={1.5} className="text-accent" />
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">AI Identified</p>
          </div>

          <h2 className="mt-2 text-xl font-bold text-text">{identifyResult.name}</h2>
          <p className="text-sm text-text-dim">{formatFormula(identifyResult.formula)}</p>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface p-3">
            <Box size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-text-dim" />
            <p className="text-xs text-text-dim">
              No 3D structure available for this molecule — here&apos;s what we know.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <InfoField label="IUPAC Name" value={identifyResult.iupac_name} />
            <InfoField label="Molar Mass" value={identifyResult.molar_mass} />
            <InfoField label="Type" value={identifyResult.type} />
            <InfoField label="Hybridization" value={identifyResult.hybridization} />
            <InfoField label="Bond Angle" value={identifyResult.bond_angle} />
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">About</p>
            <p className="mt-1 text-sm text-text-dim">{identifyResult.about}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {molecules.map((molecule) => (
          <Link
            key={molecule.id}
            href={`/molecule/${molecule.id}`}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface p-4 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pubchem2DImageUrl(molecule.pubchem_cid)}
                alt={molecule.name}
                className="h-full w-full object-contain p-2"
              />
            </div>
            <p className="mt-1 truncate text-sm font-medium text-text">{molecule.name}</p>
            <p className="text-xs text-text-dim">{formatFormula(molecule.formula)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
