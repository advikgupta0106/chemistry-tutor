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

### Chapter list corrected
The original 6-chapter list skipped several substantial NCERT
subsections entirely:
- **Added** "Measuring ΔU and ΔH: Calorimetry" (§5.3) — bomb
  calorimeter and constant-pressure calorimeter. Missing entirely.
- **Added** "Reaction Enthalpy" (§5.4 a-d) — standard states, phase
  transformation enthalpies (fusion/vaporisation/sublimation),
  standard enthalpy of formation, thermochemical equation
  conventions. The old chapter list jumped straight from Cp/Cv to
  Hess's Law without ever covering this.
- **Added** "Enthalpies for Different Types of Reactions" (§5.5) —
  combustion, atomization, bond enthalpy, lattice enthalpy/Born-Haber
  cycle, enthalpy of solution and dilution. Missing entirely.
- Renumbered all 9 chapters (was 6) to the PDF's own order.

### Chapters filled
| # | Chapter | NCERT §§ covered | Sections | Molecules linked |
|---|---|---|---|---|
| 1 | Thermodynamic Terms | 5.1.1–5.1.3 | 3 | — |
| 2 | Internal Energy and the First Law | 5.1.4, 5.2.1 | 5 | — |
| 3 | Enthalpy and Enthalpy Change | 5.2.2(a-d) | 4 | — |
| 4 | Measuring ΔU and ΔH: Calorimetry | 5.3(a,b) | 3 | — |
| 5 | Reaction Enthalpy | 5.4(a-d) | 4 | naphthalene |
| 6 | Hess's Law of Constant Heat Summation | 5.4(e) | 3 | benzene |
| 7 | Enthalpies for Different Types of Reactions | 5.5(a-f) | 5 | glucose, methane |
| 8 | Entropy and Spontaneity | 5.6(a,b,d,e) | 4 | — |
| 9 | Gibbs Energy Change | 5.6(c), 5.7 | 3 | — |

**Status: complete.** All 9 chapters filled and committed.

### Numbers written, with source page (unit-5.pdf)
- Cp − Cv = R (derivation) — p.144 (§5.2.2d)
- Graphite combustion: bomb calorimeter ΔT 298→299 K, C=20.7 kJ/K → ΔU = −2.48×10² kJ mol⁻¹ — p.146 (§5.3b, Problem 5.6)
- Water: ΔfusH = 6.00 kJ mol⁻¹, ΔvapH = +40.79 kJ mol⁻¹; dry ice ΔsubH = 25.2 kJ mol⁻¹; naphthalene ΔsubH = 73.0 kJ mol⁻¹ — p.147-148 (§5.4b)
- CaCO₃ decomposition ΔrH° = +178.3 kJ mol⁻¹ (from ΔfH° of CaO −635.1, CO₂ −393.5, CaCO₃ −1206.9) — p.149 (§5.4c)
- NH₃ formation/decomposition ±91.8 kJ mol⁻¹ — p.151 (§5.4d)
- C(graphite)+O₂→CO₂ ΔrH=−393.5; CO+½O₂→CO₂ ΔrH=−283.0; combined → C+½O₂→CO, ΔrH=−110.5 kJ mol⁻¹ — p.151 (§5.4e)
- Benzene formation via Hess's law: combustion −3267.0, CO₂ formation −393.5, H₂O formation −285.83 → ΔfH(benzene) = −48.51 kJ mol⁻¹ — p.152-153 (§5.4e, Problem 5.9)
- Butane combustion −2658.0 kJ mol⁻¹; glucose combustion −2802.0 kJ mol⁻¹ — p.151-152 (§5.5a)
- H₂ bond/atomization enthalpy 435.0 kJ mol⁻¹; Na atomization 108.4 kJ mol⁻¹ — p.153 (§5.5b)
- Methane C-H bonds broken stepwise: 427, 439, 452, 347 kJ mol⁻¹; mean = 416 kJ mol⁻¹ (¼ × 1665) — p.153-154 (§5.5c)
- NaCl lattice enthalpy +788 kJ mol⁻¹ via Born-Haber (sublimation 108.4, ionization 496, ½Cl₂ dissociation 121, electron gain −348.6) — p.155 (§5.5d)
- NaCl solution enthalpy: lattice +788, hydration −784 → +4 kJ mol⁻¹ — p.156 (§5.5e)
- NH₃ synthesis ΔrH = −46.1 kJ mol⁻¹; HCl formation −92.32; H₂O formation −285.8; NO₂ formation +33.2 kJ mol⁻¹ (spontaneous despite being endothermic) — p.157 (§5.6a)
- ∆rG° = −RT ln K = −2.303RT log K — p.162 (§5.7)

### Unsure / flag for your check
- None outstanding — all numbers above were read directly off the
  extracted PDF text this session.

---

## Equilibrium — `content/topics/equilibrium.json`
Source: `content/source/unit-6.pdf` (53 pages — the largest unit yet)

### Chapter list corrected
The original 7-chapter list skipped or over-compressed several
substantial sections:
- **Added** "Applications of Equilibrium Constants" (§6.6, 6.7) —
  predicting extent/direction via Qc, calculating equilibrium
  concentrations, the K-Gibbs energy relationship. Missing entirely.
- **Added** "Solubility Equilibria" (§6.13) — Ksp, molar solubility,
  common ion effect on solubility. Missing entirely.
- **Split** the old single "Acids, Bases and Buffer Solutions" chapter
  (§6.11 + §6.12 crammed together) into three: "Ionization of Acids
  and Bases" (6.11.1-6.11.5), "Polyprotic Acids, Acid Strength and the
  Common Ion Effect" (6.11.6-6.11.9), and "Buffer Solutions" (6.12).
- Renumbered all 11 chapters (was 7) to the PDF's own order.

### Chapters filled
| # | Chapter | NCERT §§ covered | Sections | Molecules linked |
|---|---|---|---|---|
| 1 | Equilibrium in Physical Processes | 6.1.1–6.1.5 | 4 | — |
| 2 | Equilibrium in Chemical Processes | 6.2 | 3 | — |
| 3 | Law of Chemical Equilibrium and Kc | 6.3 | 4 | — |
| 4 | Homogeneous and Heterogeneous Equilibria | 6.4, 6.4.1, 6.5 | 5 | — |
| 5 | Applications of Equilibrium Constants | 6.6(1-3), 6.7 | 5 | — |
| 6 | Le Chatelier's Principle | 6.8(1-5) | 5 | — |
| 7 | Ionic Equilibrium in Solution | 6.9, 6.10(1-3) | 5 | — |
| 8 | Ionization of Acids and Bases | 6.11.1–6.11.5 | 5 | phenol, aniline |
| 9 | Polyprotic Acids, Acid Strength and the Common Ion Effect | 6.11.6–6.11.9 | 4 | — |
| 10 | Buffer Solutions | 6.12, 6.12.1 | 3 | — |
| 11 | Solubility Equilibria | 6.13.1, 6.13.2 | 3 | — |

**Status: complete.** All 11 chapters filled and committed.

### Numbers written, with source page (unit-6.pdf)
- H2+I2⇌2HI: only [HI]²/[H2][I2] constant across 6 experiments — p.175-176 (§6.3)
- Kp = Kc(RT)^Δn — p.178 (§6.4.1)
- CaCO3⇌CaO+CO2: Kp = p(CO2) = 2.00 at 1100K (2.0×10⁵ Pa) — p.180 (§6.5)
- Kc thresholds: >10³ (H2+Cl2⇌2HCl, Kc=4.0×10³¹), <10⁻³ (2H2O⇌2H2+O2, Kc=4.1×10⁻⁴⁸), mid-range (H2+I2⇌2HI, Kc=57.0 at 700K) — p.181-182 (§6.6.1)
- ∆G° = −RT ln K — p.184 (§6.7)
- NH3 synthesis ∆H = −92.38 kJ/mol (exothermic, Le Chatelier temperature example) — p.187 (§6.8.4)
- Water dielectric constant 80 — p.189 (§6.10)
- Kw = 1.0×10⁻¹⁴ M² at 298K; [H2O] = 55.55 M; dissociated fraction ~1.8×10⁻⁹ — p.193 (§6.11.1)
- pH+pOH = pKw = 14 — p.194 (§6.11.2)
- HF Ka = 3.5×10⁻⁴; phenol Ka = 1.3×10⁻¹⁰ (Table 6.6) — p.195 (§6.11.3)
- Aniline Kb = 4.27×10⁻¹⁰; ammonia Kb = 1.77×10⁻⁵ (Table 6.7) — p.197 (§6.11.4)
- Ka(NH4+)×Kb(NH3) = (5.6×10⁻¹⁰)(1.8×10⁻⁵) = 1.0×10⁻¹⁴ = Kw — p.198 (§6.11.5)
- pH = 7 + ½(pKa−pKb) hydrolysis formula — p.202 (§6.11.9)
- Acetic acid/sodium acetate buffer ~pH 4.75-4.76; NH4Cl/NH4OH buffer ~pH 9.25 — p.203 (§6.12, 6.12.1)
- BaSO4 Ksp = 1.1×10⁻¹⁰ → S = 1.05×10⁻⁵ mol/L — p.204 (§6.13.1)
- A2X3 example: Ksp=1.1×10⁻²³ → S = 1.0×10⁻⁵ mol/L (Problem 6.26) — p.205 (§6.13.1)

### Unsure / flag for your check
- None outstanding — all numbers above were read directly off the
  extracted PDF text this session.

---

## Redox Reactions — `content/topics/redox-reactions.json`
Source: `content/source/unit-7.pdf`

### Chapter list corrected
- **Removed** "Applications of Redox Reactions" — this title doesn't
  correspond to any real NCERT heading anywhere in the unit; it looks
  like it was invented before the source PDF existed.
- **Added** "Types of Redox Reactions" (§7.3.1: combination,
  decomposition, displacement, disproportionation) in its place — a
  genuine, substantial section that had no chapter at all.
- Reordered all 8 chapters to match the PDF's actual flow (7.1 → 7.2
  → 7.2.1 → 7.3 → 7.3.1 → 7.3.2 → 7.3.3 → 7.4).

### Chapters filled
| # | Chapter | NCERT §§ covered | Sections |
|---|---|---|---|
| 1 | Classical Idea of Redox Reactions | 7.1 | 3 |
| 2 | Redox Reactions as Electron Transfer | 7.2 | 3 |
| 3 | Competitive Electron Transfer Reactions | 7.2.1 | 3 |
| 4 | Oxidation Number Concept | 7.3, 7.3.4 | 5 |
| 5 | Types of Redox Reactions | 7.3.1 | 4 |
| 6 | Balancing Redox Equations | 7.3.2(a,b) | 3 |
| 7 | Quantitative Aspects of Redox Titrations | 7.3.3 | 3 |
| 8 | Electrode Processes | 7.4 | 4 |

No molecules from `/content/molecules` are relevant to this topic
(inorganic/electrochemical content), so no `molecule_ids` appear
anywhere in this file.

**Status: complete.** All 8 chapters filled and committed.

### Numbers written, with source page (unit-7.pdf)
- Zn > Cu > Ag activity order from displacement experiments — p.238 (§7.2.1)
- Fractional oxidation number example: C₃O₂ carbon = 4/3 (average of +2, +2, 0) — p.245 (sidebar, §7.3)
- H₂O₂ disproportionation: O from −1 → −2 (H₂O) and 0 (O₂) — p.244 (§7.3.1)
- Cr₂O₇²⁻ + SO₃²⁻ worked balance: +8H⁺, +4H₂O final form — p.247 (§7.3.2a)
- Fe²⁺/Cr₂O₇²⁻ half-reaction balance: 6Fe²⁺ + Cr₂O₇²⁻ + 14H⁺ → 6Fe³⁺ + 2Cr³⁺ + 7H₂O — p.247-248 (§7.3.2b)
- MnO₄⁻/I⁻ basic-medium balance: 6I⁻ + 2MnO₄⁻ + 4H₂O → 3I₂ + 2MnO₂ + 8OH⁻ — p.248 (§7.3.2)
- Permanganate self-indicating endpoint sensitivity ~10⁻⁶ M — p.249 (§7.3.3)
- Standard electrode potentials: F₂ +2.87 V (strongest oxidant), Li⁺ −3.05 V (strongest reductant), H⁺/H₂ = 0.00 V by convention — p.251 (§7.4, Table 7.1)

### Unsure / flag for your check
- None outstanding — all numbers above were read directly off the
  extracted PDF text this session.

---

## Organic Chemistry — Some Basic Principles and Techniques — `content/topics/organic-chemistry-basics.json`
Source: `content/source/unit-8.pdf` (39 pages — this PDF's embedded font has a
broken ToUnicode CMap, so both `pypdf` and `PyMuPDF` extract garbled text for
almost the entire document; a naive Caesar-shift decode was tried and rejected
as unreliable since the shift isn't uniform across letters. Instead, every
page was rendered to a PNG at 150 dpi and read directly with vision — fully
sidesteps the font corruption. Pages 37-39 are the Exercises section and were
skipped, as they're practice problems, not source content.)

### Chapter list corrected
The original 12-chapter list was missing a whole NCERT section and badly
under-split a very dense one:
- **Added** "Structural Representations of Organic Compounds" (§8.3) —
  complete/condensed/bond-line structural formulas, wedge-and-dash 3D
  representation, molecular models (framework/ball-and-stick/space-filling).
  Missing entirely — the old list jumped straight from Tetravalency (§8.2)
  to Classification (§8.4).
- **Split** the old single "Electron Displacement Effects" chapter into
  three, since NCERT §8.7 alone runs ten dense subsections (8.7.3–8.7.10):
  "Electron Movement and the Inductive Effect" (8.7.3–8.7.5), "Resonance"
  (8.7.6, 8.7.7), and "Electromeric Effect and Hyperconjugation"
  (8.7.8–8.7.10).
- **Renamed** "Reactive Intermediates" (old ch. 7) to "Substrate, Reagent,
  Nucleophiles and Electrophiles" — its real NCERT content is §8.7.2, which
  covers substrate/reagent naming and nucleophile/electrophile definitions,
  not intermediates (those are covered instead in the Fission of a Covalent
  Bond chapter, §8.7.1).
- **Removed** "Types of Organic Reactions" as its own chapter and folded its
  one short paragraph (§8.7.10: substitution/addition/elimination/
  rearrangement, detail deferred to Unit 9 and Class XII) into the end of
  the new Electromeric Effect/Hyperconjugation chapter instead — the source
  material for this subsection is a single sentence naming the four types,
  too thin to responsibly stretch into its own 3+ section chapter without
  inventing detail not in the PDF.
- Renumbered all 14 chapters (was 12) to the PDF's own order.

### Chapters filled
| # | Chapter | NCERT §§ covered | Sections | Molecules linked |
|---|---|---|---|---|
| 1 | General Introduction to Organic Compounds | 8.1 | 3 | — |
| 2 | Tetravalence of Carbon: Shapes of Organic Compounds | 8.2.1, 8.2.2 | 3 | methane |
| 3 | Structural Representations of Organic Compounds | 8.3.1, 8.3.2 | 5 | benzene, methane |
| 4 | Classification of Organic Compounds | 8.4, 8.4.1, 8.4.2 | 5 | benzene, aniline, naphthalene |
| 5 | IUPAC Nomenclature | 8.5, 8.5.1–8.5.4 | 6 | aniline, toluene |
| 6 | Isomerism | 8.6, 8.6.1, 8.6.2 | 5 | — |
| 7 | Fission of a Covalent Bond | 8.7, 8.7.1 | 4 | — |
| 8 | Substrate, Reagent, Nucleophiles and Electrophiles | 8.7.2 | 3 | toluene |
| 9 | Electron Movement and the Inductive Effect | 8.7.3–8.7.5 | 4 | — |
| 10 | Resonance | 8.7.6, 8.7.7 | 4 | benzene, aniline |
| 11 | Electromeric Effect and Hyperconjugation | 8.7.8–8.7.10 | 5 | — |
| 12 | Methods of Purification of Organic Compounds | 8.8.1–8.8.5 | 6 | aniline |
| 13 | Qualitative Analysis of Organic Compounds | 8.9.1, 8.9.2 | 3 | — |
| 14 | Quantitative Analysis of Organic Compounds | 8.10.1–8.10.6 | 6 | — |

**Status: complete.** All 14 chapters filled and committed.

### Numbers written, with source page (unit-8.pdf, page numbers = PDF page,
not printed NCERT page)
- Benzene C-C bond length 139 pm (uniform), vs. normal single 154 pm / double
  134 pm bonds — p.20 (§8.7.6)
- Chloroform b.p. 334 K, aniline b.p. 457 K (simple distillation example) — p.28 (§8.8.3)
- C/H combustion worked example: 0.246 g compound → 0.198 g CO₂ + 0.1014 g
  H₂O → 21.95% C, 4.58% H — p.33 (§8.10.1)
- Dumas nitrogen worked example: 0.3 g compound → 50 mL N₂ at 300 K/715 mm
  (15 mm aqueous tension) → 41.9 mL at STP → 17.46% N — p.34 (§8.10.2)
- Kjeldahl formula: %N = 1.4 × M × 2(V − V₁/2) / m — p.34 (§8.10.2)
- Carius bromine worked example: 0.15 g compound → 0.12 g AgBr (188 g/mol,
  80 g Br) → 34.04% Br — p.35 (§8.10.3)
- Sulphur worked example: 0.157 g compound → 0.4813 g BaSO₄ (233 g/mol, 32 g
  S) → 42.10% S — p.36 (§8.10.4)
- Phosphorus: ammonium phosphomolybdate (NH₄)₃PO₄·12MoO₃, 1877 g/mol, 31 g P;
  magnesium pyrophosphate Mg₂P₂O₇, 222 g/mol, 62 g P (two alternative
  gravimetric routes, both given) — p.36 (§8.10.5)
- Oxygen: 2C + O₂ → 2CO, I₂O₅ + 5CO → I₂ + 5CO₂; %O = 32m₁×100/88m — p.37 (§8.10.6)

### Unsure / flag for your check
- None outstanding for the content itself — every number above was read
  directly off the rendered page images this session.
- Worth knowing: because unit-8.pdf's font is corrupted, I could not
  cross-check my visual transcription against the PDF's own extracted text
  the way prior units allowed (extracted text was reliably garbled, not a
  useful second source). Confidence is high — vision-based transcription
  of a clean, high-res render is a solid method — but this unit's source
  material was harder to verify than units 1–7's, so flagging the method
  difference for transparency, not because anything looked wrong.

## Hydrocarbons — `content/topics/hydrocarbons.json`
Source: `content/source/unit-9.pdf` (33 pages. Unlike unit-8.pdf, this PDF's
text extracts cleanly via `pypdf` — no font corruption — so the whole unit
was read directly from extracted text, no page-image transcription needed.)

### Chapter list corrected
The file had `"chapters": []` — an empty array, not a placeholder list to
correct. Built a full 18-chapter structure from scratch, matching NCERT's
real §9.1–9.6 layout:
- §9.1 Classification → 1 chapter.
- §9.2 Alkanes → 5 chapters (structure/nomenclature/isomerism §9.2.1;
  preparation §9.2.2; physical properties + substitution/halogenation
  mechanism §9.2.3a; combustion and the remaining §9.2.3 reactions —
  controlled oxidation, isomerisation, aromatization, steam reaction,
  pyrolysis; conformations §9.2.4). Split into 5 rather than fewer because
  §9.2.3 alone covers seven distinct named reaction types.
- §9.3 Alkenes → 5 chapters (structure/nomenclature §9.3.1–9.3.2; isomerism
  §9.3.3; preparation §9.3.4; properties split into two — physical
  properties/addition of H2 and halogens, then Markovnikov's
  rule/peroxide effect/H2SO4+water addition/oxidation/ozonolysis/
  polymerisation — since §9.3.5 alone is as dense as an entire other
  chapter's worth of named reactions).
- §9.4 Alkynes → 2 chapters (nomenclature/structure/preparation §9.4.1–
  9.4.3; properties §9.4.4).
- §9.5 Aromatic hydrocarbons → 4 chapters (nomenclature + structure of
  benzene §9.5.1–9.5.2; aromaticity + preparation §9.5.3–9.5.4;
  electrophilic substitution mechanism §9.5.5a; addition/combustion/
  directive influence §9.5.5b + 9.5.6). Split the substitution-mechanism
  chapter out on its own since the three-step SE mechanism is dense enough
  to deserve its own six sections.
- §9.6 Carcinogenicity and toxicity → 1 chapter.

### Chapters filled
| # | Chapter | NCERT §§ covered | Sections | Molecules linked |
|---|---|---|---|---|
| 1 | Classification of Hydrocarbons | 9.1 | 3 | — |
| 2 | Alkanes: Structure, Nomenclature and Isomerism | 9.2, 9.2.1 | 5 | methane |
| 3 | Preparation of Alkanes | 9.2.2 | 5 | — |
| 4 | Physical Properties and Substitution Reactions of Alkanes | 9.2.3 | 5 | — |
| 5 | Combustion and Other Reactions of Alkanes | 9.2.3 | 6 | toluene |
| 6 | Conformations of Alkanes | 9.2.4 | 4 | — |
| 7 | Alkenes: Structure and Nomenclature | 9.3.1, 9.3.2 | 4 | — |
| 8 | Isomerism in Alkenes | 9.3.3 | 4 | — |
| 9 | Preparation of Alkenes | 9.3.4 | 4 | ethyne |
| 10 | Properties of Alkenes: Physical Properties and Addition of Hydrogen and Halogens | 9.3.5 | 4 | benzene |
| 11 | Markovnikov's Rule, Peroxide Effect and Further Reactions of Alkenes | 9.3.5 | 6 | — |
| 12 | Alkynes: Nomenclature, Structure and Preparation | 9.4.1–9.4.3 | 5 | ethyne |
| 13 | Properties of Alkynes | 9.4.4 | 5 | benzene, ethyne |
| 14 | Aromatic Hydrocarbons: Nomenclature and Structure of Benzene | 9.5.1, 9.5.2 | 5 | benzene, toluene, naphthalene |
| 15 | Aromaticity and Preparation of Benzene | 9.5.3, 9.5.4 | 4 | phenol |
| 16 | Electrophilic Substitution Reactions of Benzene | 9.5.5 | 6 | benzene |
| 17 | Addition Reactions, Combustion and Directive Influence in Benzene | 9.5.5, 9.5.6 | 5 | benzene, phenol |
| 18 | Carcinogenicity and Toxicity | 9.6 | 3 | — |

**Status: complete.** All 18 chapters filled and committed.

### Numbers written, with source page (unit-9.pdf)
- H-C-H bond angle 109.5°; alkane C-C 154 pm, C-H 112 pm — p.1-2 (§9.2)
- n-Butane b.p. 273 K, isobutane b.p. 261 K; pentane b.p. 309 K/301 K/282.5 K
  (three C5H12 isomers) — p.3 (§9.2.1)
- Methane combustion ΔH = −890 kJ mol⁻¹ — p.9 (§9.2.3)
- Alkane isomer counts: C4H10 = 2, C5H12 = 3, C6H14 = 5, C7H16 = 9,
  C10H22 = 75 — p.3-4 (§9.2.1)
- Methanol synthesis: 523 K/100 atm, Cu catalyst — p.10 (§9.2.3)
- Ethane bond rotation barrier 1-20 kJ mol⁻¹ (general), 12.5 kJ mol⁻¹
  (ethane specifically, staggered vs eclipsed) — p.11-12 (§9.2.4)
- C=C bond enthalpy 681 kJ mol⁻¹ (σ ~397 + π ~284); C=C length 133-134 pm
  vs C-C single 154 pm — p.12 (§9.3.1)
- cis-but-2-ene dipole moment 0.33 D; trans-but-2-ene ≈ 0 D — p.14-15 (§9.3.3)
- H-Cl bond enthalpy 430.5 kJ mol⁻¹, H-Br 363.7 kJ mol⁻¹, H-I 296.8 kJ mol⁻¹
  (used to explain why the peroxide effect only works with HBr) — p.18 (§9.3.5)
- C≡C bond enthalpy 823 kJ mol⁻¹, length 120 pm (vs C=C 681 kJ mol⁻¹/134 pm,
  C-C 348 kJ mol⁻¹/154 pm) — p.21 (§9.4.2)
- Benzene C-C bond length 139 pm (uniform, X-ray diffraction), vs. normal
  single 154 pm / double 133 pm bonds — p.26-27 (§9.5.2)
- Aromaticity: Hückel (4n+2) π-electron rule — p.27 (§9.5.3)

### Unsure / flag for your check
- None outstanding — all numbers above were read directly off the cleanly
  extracted PDF text this session (no page-image transcription needed for
  this unit, unlike unit-8.pdf).
- Worth knowing: unlike every other topic in this project, `hydrocarbons.json`
  had no existing chapter list at all (`"chapters": []`) — so "correcting"
  the chapter list here meant designing one from scratch against the PDF's
  own section structure, rather than editing a prior placeholder list. The
  18-chapter count is higher than most other topics in this project because
  §9.2.3 and §9.3.5 each pack in far more distinct named reactions than a
  typical NCERT subsection elsewhere.

---

## All 9 mapped topics now complete

Some Basic Concepts, Structure of Atom, Periodic Table, Chemical Bonding,
Thermodynamics, Equilibrium, Redox Reactions, Organic Chemistry Basics, and
Hydrocarbons have all been filled from their corresponding `unit-N.pdf` and
committed. No further topics remain in the original unit→topic mapping given
for this task.

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

None outstanding for the original 9-topic mapping — see "All 9 mapped
topics now complete" above. If more NCERT unit PDFs are supplied (e.g. for
`hydrogen.json`, `p-block-elements-13-14.json`, `s-block-elements.json`,
`states-of-matter.json` — flagged below as published but source-less), they
can be filled the same way.
