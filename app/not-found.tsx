import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="mb-8">
        <Logo size="md" />
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15">
        <FlaskConical size={28} strokeWidth={1.5} className="text-accent" />
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent">404</p>
      <h1 className="mt-2 text-xl font-bold text-text">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-xs text-sm text-text-dim">
        The page you&apos;re looking for may have moved or the link might be broken.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
