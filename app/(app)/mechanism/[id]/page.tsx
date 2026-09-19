import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MechanismClient from "@/components/MechanismClient";
import { getAllMechanisms, getMechanism } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export function generateStaticParams() {
  return getAllMechanisms().map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mechanism = getMechanism(id);
  if (!mechanism) return {};

  return pageMetadata(
    mechanism.title,
    `Step-by-step reaction mechanism for ${mechanism.example}, in ${mechanism.steps.length} stages.`
  );
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
