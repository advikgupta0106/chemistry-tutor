"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import MoleculeViewerClient from "@/components/MoleculeViewerClient";
import type { Molecule } from "@/lib/content";
import { fetchPubChemProperties } from "@/lib/pubchem";

type LoadState = "loading" | "loaded" | "error";

export default function PubChemMoleculeClient({
  cid,
  allMolecules,
}: {
  cid: number;
  allMolecules: Molecule[];
}) {
  const [state, setState] = useState<LoadState>("loading");
  const [molecule, setMolecule] = useState<Molecule | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setMolecule(null);

    fetchPubChemProperties(cid).then((props) => {
      if (cancelled) return;
      if (!props) {
        setState("error");
        return;
      }
      // PubChem's property API gives us name/formula/molar mass reliably,
      // but not the curated fields (type, hybridization, bond angle) the
      // 8 pre-loaded molecules have — shown honestly as "—" rather than
      // guessed, since we have no real source for them here.
      setMolecule({
        id: String(cid),
        name: props.name,
        formula: props.formula,
        molar_mass: props.molarMass,
        type: "Compound (PubChem)",
        hybridization: "—",
        bond_angle: "—",
        about: props.iupacName
          ? `IUPAC name: ${props.iupacName}. Loaded from PubChem (CID ${cid}).`
          : `Loaded from PubChem (CID ${cid}).`,
        pubchem_cid: cid,
      });
      setState("loaded");
    });

    return () => {
      cancelled = true;
    };
  }, [cid]);

  if (state === "loading") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-20 text-center md:max-w-2xl">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="text-sm text-text-dim">Loading molecule from PubChem…</p>
      </div>
    );
  }

  if (state === "error" || !molecule) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-20 text-center md:max-w-2xl">
        <AlertCircle size={28} strokeWidth={1.5} className="text-text-dim" />
        <p className="text-sm text-text-dim">Couldn&apos;t load this molecule from PubChem.</p>
      </div>
    );
  }

  return <MoleculeViewerClient molecule={molecule} allMolecules={allMolecules} />;
}
