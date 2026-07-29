# Content Status Log

Running log of NCERT-sourced chapter content added to `/content/topics/*.json`.
Source PDFs live in `content/source/*.pdf`. Every number, formula and citation
below should be checkable against the matching PDF page fast.

Legend: ✅ filled from PDF · ⬜ empty, flagged (no matching NCERT content found
or PDF not yet supplied) · 🚫 removed (didn't correspond to a real NCERT section)

---

## Chemical Bonding and Molecular Structure — `content/topics/chemical-bonding.json`
Source: `content/source/unit-4.pdf` (NCERT Class 11, Unit 4)

### Chapter list corrected
The original 14-chapter list didn't match the PDF's actual section structure.
Changed:
- **Removed** `covalent-bond` (ch. 3) — the covalent bond isn't a separate
  numbered NCERT section in this edition; it's part of §4.1, already covered
  in the Kossel-Lewis chapter.
- **Merged** `resonance` (old ch. 8) and `polarity-of-bonds` (old ch. 9) into
  `bond-parameters` (ch. 3) — in the PDF, resonance (§4.3.5) and polarity of
  bonds (§4.3.6, incl. dipole moment) are subsections of §4.3 Bond Parameters,
  not their own top-level sections.
- **Removed** `metallic-bond` and `dipole-moment` (old ch. 13, 14) — neither
  exists as a distinct section anywhere in this PDF. Dipole moment is a
  subsection of §4.3.6 (folded into `bond-parameters`); metallic bonding
  isn't covered in this unit at all.
- Renumbered the remaining 9 chapters to follow the PDF's own order (§4.1–§4.9).
- `kossel-lewis` (ch. 1) and `hybridization` (ch. 6, was ch. 5) — **content
  untouched**, per instructions; only the `number` field on `hybridization`
  changed (5 → 6) to reflect the corrected order.

### Chapters filled
| # | Chapter | NCERT §§ covered | Sections | Molecules linked |
|---|---|---|---|---|
| 1 | Kossel-Lewis Approach to Bonding | 4.1, 4.1.1–4.1.5 | 5 | ethyne, methane |
| 2 | Ionic or Electrovalent Bond | 4.2, 4.2.1 | 3 | — |
| 3 | Bond Parameters | 4.3.1–4.3.6 | 6 | — |
| 4 | VSEPR Theory | 4.4 | 3 | methane |
| 5 | Valence Bond Theory | 4.5, 4.5.1–4.5.5 | 5 | methane |
| 6 | Hybridisation | 4.6, 4.6.1–4.6.3 | 6 | ethyne, benzene, methane |
| 7 | Molecular Orbital Theory | 4.7, 4.7.1–4.7.5 | 5 | — |
| 8 | Bonding in Some Homonuclear Molecules | 4.8 | 4 | — |
| 9 | Hydrogen Bonding | 4.9, 4.9.1, 4.9.2 | 3 | — |

**Status: complete.** All 9 chapters filled and committed individually.

### Numbers written, with source page (unit-4.pdf)
- Na ionisation enthalpy 495.8 kJ mol⁻¹, Cl electron gain enthalpy −348.7 kJ mol⁻¹,
  NaCl lattice enthalpy 788 kJ mol⁻¹ — p.7–8 (§4.2)
- Cl covalent radius 99 pm, van der Waals radius 180 pm — p.9 (§4.3.1)
- H–H bond enthalpy 435.8 kJ mol⁻¹, O=O 498 kJ mol⁻¹, N≡N 946.0 kJ mol⁻¹ — p.9 (§4.3.3)
- H₂O O–H bond enthalpies 502 / 427 kJ mol⁻¹, average 464.5 kJ mol⁻¹ — p.10 (§4.3.3)
- O₃ bond lengths: single 148 pm, double 121 pm, actual 128 pm — p.10 (§4.3.5)
- Debye conversion 1 D = 3.33564×10⁻³⁰ C m; H₂O dipole 1.85 D; NH₃ 4.90×10⁻³⁰ C m;
  NF₃ 0.8×10⁻³⁰ C m — p.12–13 (§4.3.6)
- H₂ bond length 74 pm, bond enthalpy 435.8/438 kJ mol⁻¹ (both figures appear in
  the PDF, in §4.5 and §4.8 respectively — used each in its own section) — p.19, p.29
- Ethane/ethene/ethyne bond lengths and angles (C–C 154 pm, C=C 134 pm, H–C–H 117.6°,
  H–C–C 121°, etc.) — p.24–25 (§4.6.2) — carried over unchanged from the
  already-approved Hybridisation chapter, not re-verified this session.
- H₂ bond order 1, He₂/Be₂ bond order 0, Li₂ bond order 1, C₂ bond order 2,
  O₂ bond order 2 with 2 unpaired π* electrons — p.29–31 (§4.8)

### Unsure / flag for your check
- None outstanding for this topic — all numbers above were read directly off
  the extracted PDF text this session.

---

## Some Basic Concepts of Chemistry — `content/topics/some-basic-concepts.json`
Source: `content/source/unit-1.pdf`

### Chapter list corrected
The original 8-chapter list skipped two whole NCERT sections entirely.
Added:
- **"Properties of Matter and their Measurement"** (§1.3) — physical vs
  chemical properties, SI base units, mass/weight, volume, density,
  temperature. None of this had a chapter before.
- **"Uncertainty in Measurement"** (§1.4) — scientific notation,
  significant figures, precision/accuracy, dimensional analysis. Also
  missing entirely.

Renumbered the existing 8 chapters to make room (they were 1-8, now
1-2 stay, then the two new chapters are 3-4, and the old 3-8 become 5-10).

### Chapters filled
| # | Chapter | NCERT §§ covered | Sections | Molecules linked |
|---|---|---|---|---|
| 1 | Importance of Chemistry | 1.1 + unit intro (unnumbered) | 3 | — |
| 2 | Nature of Matter | 1.2, 1.2.1, 1.2.2 | 3 | glucose |
| 3 | Properties of Matter and their Measurement | 1.3.1–1.3.7 | 6 | — |
| 4 | Uncertainty in Measurement | 1.4.1–1.4.3 | 4 | — |
| 5 | Laws of Chemical Combination | 1.5.1–1.5.5 | 5 | — |
| 6 | Dalton's Atomic Theory | 1.6 | 3 | — |
| 7 | Atomic and Molecular Mass | 1.7.1–1.7.4 | 4 | methane, glucose |
| 8 | Mole Concept and Molar Mass | 1.8 | 3 | — |
| 9 | Percentage Composition | 1.9, 1.9.1 | 3 | — |
| 10 | Stoichiometry and Stoichiometric Calculations | 1.10, 1.10.1, 1.10.2 | 5 | methane |

**Status: complete.** All 10 chapters filled and committed.

### Numbers written, with source page (unit-1.pdf)
- 1 amu = 1.66056×10⁻²⁴ g; H atomic mass 1.0080 u; O-16 15.995 u — p.16-17 (§1.7.1)
- Carbon isotope abundances (¹²C 98.892%, ¹³C 1.108%, ¹⁴C ~0%) → average 12.011 u — p.17 (§1.7.2)
- Methane molecular mass 16.043 u; water 18.02 u; glucose 180.162 u — p.16-17, p.17 (§1.7.3, Problem 1.1)
- NaCl formula mass 58.5 u (Na 23.0 + Cl 35.5) — p.17 (§1.7.4)
- Avogadro constant 6.02214076×10²³ mol⁻¹; ¹²C atom mass 1.992648×10⁻²³ g — p.18 (§1.8)
- Water % composition 11.18% H / 88.79% O; ethanol 52.14% C / 13.13% H / 34.73% O — p.19 (§1.9)
- Worked empirical/molecular formula example: 4.07% H, 24.27% C, 71.65% Cl,
  molar mass 98.96 g → CH₂Cl → C₂H₄Cl₂ — p.19-20 (Problem 1.2, §1.9.1)
- Methane combustion: 16 g CH₄ + 2×32 g O₂ → 44 g CO₂ + 2×18 g H₂O — p.20-22 (§1.10, Problem 1.3)
- N₂ + 3H₂ → 2NH₃ limiting-reagent example (50.0 kg N₂, 10.0 kg H₂, H₂ limiting) — p.22-23 (§1.10.1, Problem 1.5)
- 1 in = 2.54 cm; 2 days = 172800 s — p.13-14 (§1.4.3, dimensional analysis examples)

### Unsure / flag for your check
- None outstanding — all numbers above were read directly off the
  extracted PDF text this session.

---

## Structure of Atom — `content/topics/structure-of-atom.json`
Source: `content/source/unit-2.pdf`
Status: ⬜ **not started**

## Periodic Table (Classification of Elements and Periodicity) — `content/topics/periodic-table.json`
Source: `content/source/unit-3.pdf`
Status: ⬜ **not started**

## Thermodynamics — `content/topics/thermodynamics.json`
Source: `content/source/unit-5.pdf`
Status: ⬜ **not started**

## Equilibrium — `content/topics/equilibrium.json`
Source: `content/source/unit-6.pdf`
Status: ⬜ **not started**

## Redox Reactions — `content/topics/redox-reactions.json`
Source: `content/source/unit-7.pdf`
Status: ⬜ **not started**

## Organic Chemistry — Some Basic Principles and Techniques — `content/topics/organic-chemistry-basics.json`
Source: `content/source/unit-8.pdf`
Status: ⬜ **not started**

## Hydrocarbons — `content/topics/hydrocarbons.json`
Source: `content/source/unit-9.pdf`
Status: ⬜ **not started**

---

## Published topics with no source PDF supplied

These are `published: true` in `/content` but weren't in the unit→PDF mapping
given for this task, so **nothing has been touched** — flagging rather than
inventing content per instructions:
- `hydrogen.json` (Hydrogen)
- `p-block-elements-13-14.json` (p-Block Elements, Groups 13–14)
- `s-block-elements.json` (s-Block Elements)
- `states-of-matter.json` (States of Matter)

If NCERT PDFs for these exist, send them and they can be filled the same way.

---

## Next step

Continue from **Some Basic Concepts** (`unit-1.pdf`) — first correct its
chapter list against the PDF's actual sections, report the changes, then fill.
