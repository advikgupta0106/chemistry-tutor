"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  RotateCw,
  ZoomIn,
  Info,
  RotateCcw,
  Ruler,
  ChevronRight,
} from "lucide-react";
import type { Molecule } from "@/lib/content";
import { formatFormula } from "@/lib/formatFormula";

type Atom3D = { elem: string; x: number; y: number; z: number };

type Viewer3D = {
  setStyle: (sel: object, style: object) => void;
  zoomTo: () => void;
  zoom: (factor: number, duration?: number) => void;
  spin: (axis: string | false, speed?: number) => void;
  render: () => void;
  addLabel: (text: string, options: object) => void;
  removeAllLabels: () => void;
  selectedAtoms: (sel: object) => Atom3D[];
  setClickable: (sel: object, clickable: boolean, callback?: (atom: Atom3D) => void) => void;
  resize: () => void;
};

type ThreeDMol = {
  createViewer: (el: HTMLElement, config: object) => Viewer3D;
  download: (query: string, viewer: Viewer3D, options: object, callback: () => void) => void;
};

declare global {
  interface Window {
    $3Dmol: ThreeDMol;
  }
}

type Style = "ballAndStick" | "spaceFill" | "wireframe";

const STYLE_SPECS: Record<Style, Record<string, unknown>> = {
  ballAndStick: { stick: { radius: 0.15 }, sphere: { scale: 0.25 } },
  spaceFill: { sphere: { scale: 1.0 } },
  wireframe: { line: {} },
};

const STYLE_LABELS: { value: Style; label: string }[] = [
  { value: "ballAndStick", label: "Ball & Stick" },
  { value: "spaceFill", label: "Space Fill" },
  { value: "wireframe", label: "Wireframe" },
];

function pubchem2DImageUrl(cid: number) {
  return `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=${cid}&t=l`;
}

export default function MoleculeViewerClient({
  molecule,
  allMolecules,
}: {
  molecule: Molecule;
  allMolecules: Molecule[];
}) {
  // Two containers exist in the DOM at once (mobile and desktop layouts,
  // toggled with CSS only), so we pick whichever one is actually visible
  // rather than sharing a single ref between both.
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer3D | null>(null);
  const measureFirstAtom = useRef<Atom3D | null>(null);

  const [scriptReady, setScriptReady] = useState(false);
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");
  const [style, setStyle] = useState<Style>("ballAndStick");
  const [spinning, setSpinning] = useState(false);
  const [labelsOn, setLabelsOn] = useState(false);
  const [measuring, setMeasuring] = useState(false);

  useEffect(() => {
    if (!scriptReady || viewMode !== "3D") return;
    const $3Dmol = window.$3Dmol;
    if (!$3Dmol) return;

    let cancelled = false;
    let rafId: number;

    function findVisibleContainer(): HTMLDivElement | null {
      const mobileWidth = mobileContainerRef.current?.getBoundingClientRect().width ?? 0;
      if (mobileWidth > 0) return mobileContainerRef.current;
      const desktopWidth = desktopContainerRef.current?.getBoundingClientRect().width ?? 0;
      if (desktopWidth > 0) return desktopContainerRef.current;
      return null;
    }

    // Right after a client-side route change, the container can briefly
    // report zero size before layout settles. Retry across a few frames
    // instead of giving up on the first check.
    function start(attempt: number) {
      if (cancelled) return;
      const container = findVisibleContainer();
      if (!container) {
        if (attempt < 30) {
          rafId = requestAnimationFrame(() => start(attempt + 1));
        }
        return;
      }

      setSpinning(false);
      setLabelsOn(false);
      setMeasuring(false);
      measureFirstAtom.current = null;

      const viewer = $3Dmol.createViewer(container, {
        backgroundColor: "#16141F",
      });
      viewerRef.current = viewer;

      $3Dmol.download(`cid:${molecule.pubchem_cid}`, viewer, {}, () => {
        if (cancelled) return;
        viewer.resize();
        viewer.setStyle({}, STYLE_SPECS[style]);
        viewer.zoomTo();
        viewer.render();
      });
    }

    start(0);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady, molecule.id, viewMode]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setStyle({}, STYLE_SPECS[style]);
    viewer.render();
  }, [style]);

  function handleRotate() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (spinning) {
      viewer.spin(false);
    } else {
      viewer.spin("y", 1);
    }
    setSpinning((s) => !s);
  }

  function handleZoom() {
    viewerRef.current?.zoom(1.2, 300);
  }

  function handleInfo() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (labelsOn) {
      viewer.removeAllLabels();
    } else {
      const atoms = viewer.selectedAtoms({});
      atoms.forEach((atom: Atom3D) => {
        viewer.addLabel(atom.elem, {
          position: { x: atom.x, y: atom.y, z: atom.z },
          fontSize: 10,
          backgroundColor: "#8B5CF6",
          backgroundOpacity: 0.85,
          borderRadius: 4,
        });
      });
    }
    viewer.render();
    setLabelsOn((v) => !v);
  }

  function handleReset() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.zoomTo();
    viewer.render();
  }

  function handleMeasure() {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (measuring) {
      viewer.setClickable({}, false);
      viewer.removeAllLabels();
      viewer.render();
      measureFirstAtom.current = null;
      setMeasuring(false);
      return;
    }

    viewer.setClickable({}, true, (atom: Atom3D) => {
      if (!measureFirstAtom.current) {
        measureFirstAtom.current = atom;
        viewer.addLabel("•", {
          position: atom,
          backgroundColor: "#4ADE80",
          fontSize: 10,
        });
        viewer.render();
      } else {
        const a = measureFirstAtom.current;
        const dx = a.x - atom.x;
        const dy = a.y - atom.y;
        const dz = a.z - atom.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(2);
        viewer.removeAllLabels();
        viewer.addLabel(`${dist} Å`, {
          position: atom,
          backgroundColor: "#8B5CF6",
          fontSize: 11,
        });
        viewer.render();
        measureFirstAtom.current = null;
      }
    });
    setMeasuring(true);
  }

  function renderCanvasArea(ref: React.RefObject<HTMLDivElement | null>) {
    return viewMode === "3D" ? (
      <div ref={ref} className="relative h-full w-full" />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={pubchem2DImageUrl(molecule.pubchem_cid)}
        alt={`${molecule.name} 2D structure`}
        className="h-full w-full object-contain p-6"
      />
    );
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/3dmol@2/build/3Dmol-min.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
              <ArrowLeft size={18} strokeWidth={1.5} className="text-text" />
            </Link>
            <h1 className="text-lg font-bold text-text">Molecule Viewer</h1>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
            <Share2 size={16} strokeWidth={1.5} className="text-text-dim" />
          </button>
        </div>

        <div className="mt-5 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text">{molecule.name}</h2>
            <p className="text-sm text-text-dim">{formatFormula(molecule.formula)}</p>
          </div>
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        <div className="mt-4 aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface">
          {renderCanvasArea(mobileContainerRef)}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <ActionButton label="Rotate" icon={RotateCw} active={spinning} onClick={handleRotate} />
          <ActionButton label="Zoom" icon={ZoomIn} onClick={handleZoom} />
          <ActionButton label="Info" icon={Info} active={labelsOn} onClick={handleInfo} />
          <ActionButton label="Reset" icon={RotateCcw} onClick={handleReset} />
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-semibold text-text">About {molecule.name}</p>
          <p className="text-sm text-text-dim">{molecule.about}</p>
        </div>
      </div>

      <div className="hidden md:flex md:h-screen">
        <div className="w-72 shrink-0 border-r border-border p-6">
          <h2 className="text-xl font-bold text-text">{molecule.name}</h2>
          <p className="text-sm text-text-dim">{formatFormula(molecule.formula)}</p>

          <div className="mt-6 flex flex-col gap-4">
            <InfoRow label="Molar Mass" value={`${molecule.molar_mass} g/mol`} />
            <InfoRow label="Type" value={molecule.type} />
            <InfoRow label="Hybridization" value={molecule.hybridization} />
            <InfoRow label="Bond Angle" value={molecule.bond_angle} />
          </div>

          <div className="mt-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-dim">About</p>
            <p className="text-sm text-text-dim">{molecule.about}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
                <ArrowLeft size={18} strokeWidth={1.5} className="text-text" />
              </Link>
              <h1 className="text-lg font-bold text-text">Molecule Viewer</h1>
            </div>
            <div className="flex items-center gap-2">
              <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
                <Share2 size={16} strokeWidth={1.5} className="text-text-dim" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-stretch gap-3 px-6 py-4">
            <div className="aspect-square min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
              {renderCanvasArea(desktopContainerRef)}
            </div>
            <div className="flex flex-col gap-2">
              <ActionButton label="Rotate" icon={RotateCw} active={spinning} onClick={handleRotate} />
              <ActionButton label="Zoom" icon={ZoomIn} onClick={handleZoom} />
              <ActionButton label="Info" icon={Info} active={labelsOn} onClick={handleInfo} />
              <ActionButton label="Measure" icon={Ruler} active={measuring} onClick={handleMeasure} />
              <ActionButton label="Reset" icon={RotateCcw} onClick={handleReset} />
            </div>
          </div>

          <div className="px-6">
            <div className="flex w-fit gap-1 rounded-xl bg-surface-2 p-1">
              {STYLE_LABELS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStyle(value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    style === value ? "bg-accent text-white" : "text-text-dim"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 overflow-x-auto px-6 pb-6">
            {allMolecules.map((m) => (
              <Link
                key={m.id}
                href={`/molecule/${m.id}`}
                className={`flex shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 ${
                  m.id === molecule.id ? "border-accent" : "border-border"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pubchem2DImageUrl(m.pubchem_cid)}
                    alt={m.name}
                    className="h-full w-full object-contain p-1"
                  />
                </div>
                <span className="text-xs text-text-dim">{m.name}</span>
              </Link>
            ))}
            <div className="flex h-14 w-9 shrink-0 items-center justify-center text-text-dim">
              <ChevronRight size={18} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ViewModeToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: "3D" | "2D";
  setViewMode: (v: "3D" | "2D") => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
      {(["3D", "2D"] as const).map((v) => (
        <button
          key={v}
          onClick={() => setViewMode(v)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold ${
            viewMode === v ? "bg-accent text-white" : "text-text-dim"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">{label}</p>
      <p className="text-sm text-text">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  active,
}: {
  label: string;
  icon: typeof RotateCw;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 ${
        active ? "border-accent bg-accent/10" : "border-border bg-surface"
      }`}
    >
      <Icon size={18} strokeWidth={1.5} className={active ? "text-accent" : "text-text-dim"} />
      <span className={`text-[11px] ${active ? "text-accent" : "text-text-dim"}`}>{label}</span>
    </button>
  );
}
