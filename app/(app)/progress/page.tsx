import ProgressClient from "@/components/ProgressClient";
import { getPublishedTopics } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Progress",
  "See how far you've come across every chemistry topic and chapter."
);

export default function ProgressPage() {
  const topics = getPublishedTopics();
  return <ProgressClient topics={topics} />;
}
