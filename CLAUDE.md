# Chem Tutor — Project Spec for Claude Code

This file is the source of truth for design and structure. Match the attached
reference mockup exactly. When in doubt, look at the mockup, not defaults.

## Stack
- Next.js 15 (App Router) + Tailwind CSS
- 3D molecules: 3Dmol.js (load via CDN, wrap in a client component)
- Backend: FastAPI (separate repo/folder `api/`) — all chemistry logic lives there
- Content: static JSON files in `/content` (see content-schema.json)
- Target: mobile-first (students on phones), then desktop dashboard layout

## Design tokens (from the reference mockup)
Colors:
- `bg`         #0B0A10  (near-black, slight purple cast — page background)
- `surface`    #16141F  (cards, panels)
- `surface-2`  #1E1B2A  (inputs, nested cards, chips)
- `border`     #2A2738  (1px card borders, subtle)
- `accent`     #8B5CF6  (primary purple — buttons, active states, progress)
- `accent-2`   #A78BFA  (gradients: accent → accent-2)
- `success`    #4ADE80  (confidence "High", positive stats)
- `warning`    #FB923C  (streak card, highlights)
- `text`       #F4F4F6
- `text-dim`   #9CA3AF

Type:
- Display + body: Inter (700 for headings, 500 medium labels, 400 body)
- Numbers/stats: Inter 700, large (stat cards: 28–32px number, 12px label above)
- Chemistry formulas: render subscripts properly (CH₃COOH) — use <sub> or KaTeX,
  never plain "CH3COOH" in user-facing text

Shape & feel:
- Card radius 16px; buttons/chips radius 10–12px; phone-frame screens radius 24px
- Cards: `surface` bg + 1px `border`, NO heavy shadows — depth comes from
  layered surface colors, not shadows
- Primary button: solid accent purple, white text, radius 12px
- Active nav item: accent purple pill/highlight
- Progress: thin rounded bars (purple/blue/green per topic) + circular ring
  (SVG stroke, green, % in center) on dashboard
- Background texture: faint molecular/network line art at ~5% opacity on hero
  and empty areas only — never behind body text
- Icons: lucide-react, 1.5px stroke, inside small rounded-square tinted
  containers (each topic gets its own tint: green flask, blue atom, purple
  bonds, orange flame, red redox — as in mockup)

## Screens (build in this order, one per session)
1. `/`            Dashboard — greeting, 4 stat cards (Topics Learned, Practice
                  Score, Reactions Solved, Study Streak), Recently Studied with
                  progress bars, circular overall-progress ring, Continue
                  Learning banner. Desktop: left sidebar nav. Mobile: bottom
                  tab bar (Home, Explore, Notebook, Progress, Profile).
2. `/explore`     Topic list — search bar, filter chips (All / Class 11 /
                  Class 12 / JEE / NEET), topic rows with tinted icon +
                  chapter count + chevron.
3. `/solve`       Reaction Solver — tabs (Solve / Balance / Predict), input,
                  purple Solve button, result card with Answer, Explanation,
                  Reaction Type, Confidence (green "High").
4. `/molecule/[id]` Molecule Viewer — 3D canvas (3Dmol.js), 3D/2D toggle,
                  name + formula, properties panel (molar mass, type,
                  hybridization, bond angle), Ball & Stick / Space Fill /
                  Wireframe toggle, molecule thumbnail strip, About card.
5. `/mechanism/[id]` Mechanism steps — numbered step list (active step in
                  purple), step explanation with structure images, Key Point
                  callout card at bottom.
6. `/practice`    Quiz — one question per screen, instant explanation after
                  answering, wrong-answer review at end, updates streak/score.

## Rules
- Mobile-first. Every screen must look right at 380px width before desktop.
- No layout shift while 3D viewer loads — reserve the canvas space.
- All content comes from `/content/*.json` — never hardcode topic text in
  components.
- All solver calls go to the FastAPI backend — no chemistry logic in the
  frontend.
- Formulas always with proper sub/superscripts. Students type plain text
  (e.g. "CH3COOH + NaOH") — the app must accept that as-is and render
  subscripts itself (see `lib/formatFormula.ts`); never require the user to
  type special characters.
- Keyboard focus visible; respect prefers-reduced-motion.
- Copy style: plain, short, active voice ("Solve", "Continue", "Practice
  Quiz"); sentence case everywhere except brand name.
