import { notFound } from "next/navigation";
import MoleculeViewerClient from "@/components/MoleculeViewerClient";
import { getAllMolecules, getMolecule } from "@/lib/content";

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

export default async function MoleculePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const molecule = getMolecule(id);
  if (!molecule) notFound();

  const allMolecules = MOLECULE_ORDER.map((molId) => getMolecule(molId)!);

  return <MoleculeViewerClient molecule={molecule} allMolecules={allMolecules} />;
}
