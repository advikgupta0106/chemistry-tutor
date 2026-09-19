import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MoleculeViewerClient from "@/components/MoleculeViewerClient";
import PubChemMoleculeClient from "@/components/PubChemMoleculeClient";
import { getAllMolecules, getMolecule } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

const MOLECULE_ORDER = [
  "benzene",
  "toluene",
  "naphthalene",
  "phenol",
  "aniline",
  "glucose",
  "methane",
  "ethyne",
];

export function generateStaticParams() {
  return getAllMolecules().map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const molecule = getMolecule(id);
  // Numeric ids are arbitrary PubChem CIDs fetched client-side (see
  // PubChemMoleculeClient below) — there's no local data to build specific
  // metadata from, so those fall back to the root layout's defaults.
  if (!molecule) return {};

  return pageMetadata(`${molecule.name} (${molecule.formula})`, molecule.about);
}

export default async function MoleculePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const allMolecules = MOLECULE_ORDER.map((molId) => getMolecule(molId)!);

  const molecule = getMolecule(id);
  if (molecule) {
    return <MoleculeViewerClient molecule={molecule} allMolecules={allMolecules} />;
  }

  // Not one of the 8 curated molecules — molecule search on /molecules
  // routes PubChem results here as numeric CIDs, so any id that looks like
  // one gets fetched and rendered dynamically instead of 404ing. This is
  // what lets students view any PubChem-known molecule, not just the
  // pre-loaded set.
  if (/^\d+$/.test(id)) {
    return <PubChemMoleculeClient cid={Number(id)} allMolecules={allMolecules} />;
  }

  notFound();
}
