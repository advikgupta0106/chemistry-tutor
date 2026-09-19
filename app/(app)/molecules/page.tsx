import { getAllMolecules } from "@/lib/content";
import MoleculesClient from "@/components/MoleculesClient";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Molecules",
  "Explore interactive 3D models of key CBSE chemistry molecules, their properties, and structures."
);

export default function MoleculesPage() {
  const molecules = getAllMolecules();
  return <MoleculesClient molecules={molecules} />;
}
