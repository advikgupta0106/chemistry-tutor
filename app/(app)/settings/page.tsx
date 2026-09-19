import SettingsClient from "@/components/SettingsClient";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata("Settings", "Manage your Atomica preferences.");

export default function SettingsPage() {
  return <SettingsClient />;
}
