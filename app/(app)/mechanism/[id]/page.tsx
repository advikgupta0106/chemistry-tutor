import { notFound } from "next/navigation";
import MechanismClient from "@/components/MechanismClient";
import { getAllMechanisms, getMechanism } from "@/lib/content";

export function generateStaticParams() {
  return getAllMechanisms().map((m) => ({ id: m.id }));
}

export default async function MechanismPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mechanism = getMechanism(id);
  if (!mechanism) notFound();

  return <MechanismClient mechanism={mechanism} />;
}
