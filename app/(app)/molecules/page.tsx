import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllMolecules } from "@/lib/content";
import { formatFormula } from "@/lib/formatFormula";

function pubchem2DImageUrl(cid: number) {
  return `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=${cid}&t=l`;
}

export default function MoleculesPage() {
  const molecules = getAllMolecules();

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
      <p className="mt-2 text-sm text-text-dim">Browse 3D structures from the syllabus.</p>

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
