import { getAllMolecules } from "@/lib/content";
import MoleculesClient from "@/components/MoleculesClient";

export default function MoleculesPage() {
  const molecules = getAllMolecules();
  return <MoleculesClient molecules={molecules} />;
}
