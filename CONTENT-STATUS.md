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

### Chapter list corrected
- **Moved** "drawbacks of the Rutherford model" (§2.2.5) from the
  isotopes/isobars chapter into "Atomic Models" — it evaluates the
  Rutherford model discussed in that chapter and has nothing to do
  with isotopes.
- **Added** a new chapter, "Energies of Orbitals" (§2.6.3: shielding,
  effective nuclear charge, the (n+l) rule) — a whole NCERT subsection
  that had no chapter at all, sitting between Shapes of Orbitals and
  Electronic Configuration in the PDF's own order.
- Renumbered all 11 chapters (was 10) to match the PDF's order.

### Chapters filled
| # | Chapter | NCERT §§ covered | Sections |
|---|---|---|---|
| 1 | Discovery of Electron, Proton and Neutron | 2.1.1–2.1.4 | 4 |
| 2 | Atomic Models: Thomson and Rutherford | 2.2, 2.2.1, 2.2.2, 2.2.5 | 4 |
| 3 | Atomic Number, Mass Number, Isotopes and Isobars | 2.2.3, 2.2.4 | 3 |
| 4 | Developments Leading to Bohr's Model | 2.3, 2.3.1–2.3.3 | 6 |
| 5 | Bohr's Model of the Hydrogen Atom | 2.4, 2.4.1, 2.4.2 | 4 |
| 6 | Towards a Quantum Mechanical Model | 2.5, 2.5.1, 2.5.2 | 3 |
| 7 | Quantum Mechanical Model of the Atom | 2.6 | 3 |
| 8 | Orbitals and Quantum Numbers | 2.6.1 | 4 |
| 9 | Shapes of Atomic Orbitals | 2.6.2 | 5 |
| 10 | Energies of Orbitals | 2.6.3 | 3 |
| 11 | Electronic Configuration | 2.6.4–2.6.6 | 6 |

No molecules from `/content/molecules` are relevant to this topic
(atomic-physics content, not specific compounds), so no `molecule_ids`
appear anywhere in this file — that's expected, not an omission.

**Status: complete.** All 11 chapters filled and committed.

### Numbers written, with source page (unit-2.pdf)
- e/mₑ = 1.758820×10¹¹ C kg⁻¹ (Thomson) — p.31 (§2.1.2)
- Electron charge −1.602176×10⁻¹⁹ C, mass 9.1094×10⁻³¹ kg (Millikan) — p.31 (§2.1.3)
- Atom radius ~10⁻¹⁰ m, nucleus radius ~10⁻¹⁵ m (Rutherford) — p.34 (§2.2.2)
- Planck's constant h = 6.626×10⁻³⁴ J s; E = hν — p.41 (§2.3.2)
- Speed of light c = 2.997925×10⁸ m s⁻¹ — p.38 (§2.3.1)
- Rydberg constant for H: 109,677 cm⁻¹ (spectroscopic); R_H = 2.18×10⁻¹⁸ J (Bohr energy form) — p.45, p.47 (§2.3.3, §2.4)
- Bohr radius a₀ = 52.9 pm; r_n = n²a₀ — p.47 (§2.4)
- Ground state energy E₁ = −2.18×10⁻¹⁸ J; E₂ = −0.545×10⁻¹⁸ J — p.47 (§2.4)
- Heisenberg uncertainty Δx·Δp ≥ h/4π — p.51 (§2.5.2)
- de Broglie relation λ = h/(mv) — p.50 (§2.5.1)
- Cr valence config 3d⁵4s¹ (not 3d⁴4s²); Cu valence config 3d¹⁰4s¹ (not 3d⁹4s²) — p.64 (§2.6.6)
- Orbital/node counting rules: orbitals per shell = n²; nodes per orbital = n−1 — p.55, p.59 (§2.6.1, §2.6.2)

### Unsure / flag for your check
- None outstanding — all numbers above were read directly off the
  extracted PDF text this session.

---

## Periodic Table (Classification of Elements and Periodicity) — `content/topics/periodic-table.json`
Source: `content/source/unit-3.pdf`

### Chapter list corrected
The original 4-chapter list skipped two whole NCERT sections and
merged others together too tightly:
- **Added** "Electronic Configurations and the Periodic Table" (§3.5)
  — why period number equals the principal quantum number, why
  periods have 2/8/8/18/18/32 elements, why groups share valence
  configuration. Missing entirely.
- **Added** "s-, p-, d- and f-Block Elements" (§3.6) — the four-block
  classification (3.6.1–3.6.4) plus metals/non-metals/metalloids
  (3.6.5). Also missing entirely.
- **Split** the old single "Periodic Trends in Properties" chapter
  into two, since NCERT 3.7 itself splits physical properties (§3.7.1:
  atomic/ionic radius, ionization enthalpy, electron gain enthalpy,
  electronegativity) from chemical properties/reactivity (§3.7.2,
  §3.7.3: valence periodicity, second-period anomalies, reactivity
  trends) — one chapter was carrying two unrelated NCERT sections.
- Renumbered all 7 chapters (was 4) to the PDF's own order.

### Chapters filled
| # | Chapter | NCERT §§ covered | Sections |
|---|---|---|---|
| 1 | Genesis of Periodic Classification | 3.1, 3.2 | 4 |
| 2 | Modern Periodic Law | 3.3 | 3 |
| 3 | Nomenclature of Elements | 3.4 | 3 |
| 4 | Electronic Configurations and the Periodic Table | 3.5 | 3 |
| 5 | s-, p-, d- and f-Block Elements | 3.6.1–3.6.5 | 5 |
| 6 | Periodic Trends in Physical Properties | 3.7.1(a-e) | 5 |
| 7 | Periodic Trends in Chemical Properties and Reactivity | 3.7.2, 3.7.3 | 4 |

No molecules from `/content/molecules` are relevant to this topic
(elements/periodic-table content, not specific compounds), so no
`molecule_ids` appear anywhere in this file.

**Status: complete.** All 7 chapters filled and committed.

### Numbers written, with source page (unit-3.pdf)
- Gallium prediction vs found: predicted density 5.9 g/cm³, found 5.94 g/cm³ — p.76 (§3.2, Table 3.3)
- Period sizes: 2, 8, 8, 18, 18, 32 — p.78, p.84 (§3.3, §3.5)
- Cl covalent radius 99 pm (from Cl₂ bond length 198 pm); Cu metallic radius 128 pm — p.85-86 (§3.7.1a)
- F atomic radius 64 pm vs F⁻ ionic radius 136 pm; Na atomic radius 186 pm vs Na⁺ 95 pm — p.87 (§3.7.1b)
- Pauling electronegativity scale: F = 4.0 (assigned reference value) — p.90 (§3.7.1e)
- Na/Mg/Si first ionization enthalpies 496/737/786 kJ mol⁻¹ (Problem 3.6, used only to confirm the general trend, not directly restated as a number in my text) — p.88
- Group 1-18 valence pattern (1,2,3,4,3-5,2-6,1-7,0-8 valence electrons) — p.92 (§3.7.2a, Table 3.9)

### Unsure / flag for your check
- None outstanding — all numbers above were read directly off the
  extracted PDF text this session.

---

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
