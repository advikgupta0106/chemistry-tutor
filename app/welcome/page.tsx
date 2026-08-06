import Link from "next/link";
import Logo from "@/components/Logo";
import MoleculeHero from "@/components/MoleculeHero";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen justify-center bg-bg">
      <div className="flex w-full max-w-md flex-col px-6">
        <div className="min-h-0 flex-1 pt-10">
          <MoleculeHero />
        </div>

        <div className="flex flex-col gap-3 pb-8">
          <div className="mx-auto">
            <Logo size="lg" />
          </div>
          <p className="text-xs font-medium tracking-[0.2em] text-accent">
            LEARN &bull; EXPLORE &bull; MASTER
          </p>
        </div>

        <div className="pb-10">
          <p className="mb-4 text-sm text-text-dim">
            Your intelligent companion for chemistry mastery.
          </p>
          <Link
            href="/"
            className="block w-full rounded-xl bg-accent py-3.5 text-center text-sm font-semibold text-white"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
