"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { getUserClass, setUserClass, type UserClass } from "@/lib/userClass";

const OPTIONS: { value: UserClass; label: string; hint: string }[] = [
  { value: "10", label: "Class 10", hint: "NCERT Class 10 Chemistry" },
  { value: "11", label: "Class 11", hint: "NCERT Class 11 Chemistry" },
];

// Shown once, the first time the app loads with no class chosen yet — every
// class-filtered list (Explore, Home, the reaction solver's chapter picker)
// depends on this being set, so there's no skip option. Settings is where a
// student changes it afterward.
export default function ClassSelectionModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getUserClass() === null);
  }, []);

  if (!open) return null;

  function choose(value: UserClass) {
    setUserClass(value);
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2">
          <GraduationCap size={20} strokeWidth={1.5} className="text-accent" />
          <h2 className="text-base font-bold text-text">Which class are you in?</h2>
        </div>
        <p className="mt-1 text-sm text-text-dim">
          This sets which chapters and topics you see. You can change it later in Settings.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => choose(opt.value)}
              className="rounded-xl border border-border bg-surface-2 p-4 text-left hover:border-accent"
            >
              <p className="text-sm font-semibold text-text">{opt.label}</p>
              <p className="text-xs text-text-dim">{opt.hint}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
