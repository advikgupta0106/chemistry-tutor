const SUBSCRIPT_DIGITS: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
};

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

const SUPERSCRIPT_SIGNS: Record<string, string> = { "+": "⁺", "-": "⁻" };

// A sign is either the ASCII a student can type ("+"/"-") or the unicode
// superscript form the insert-buttons produce directly ("⁺"/"⁻"). Both mean
// the same thing to every regex below, so they're always matched together —
// otherwise a digit typed right before a button-tapped "⁺"/"⁻" would never
// be recognized as part of the charge at all.
const SIGN_CLASS = "+\\-⁺⁻";

function toSubscriptDigits(digits: string): string {
  return digits.split("").map((d) => SUBSCRIPT_DIGITS[d] ?? d).join("");
}

function toSuperscriptChars(chars: string): string {
  return chars.split("").map((c) => SUPERSCRIPT_DIGITS[c] ?? SUPERSCRIPT_SIGNS[c] ?? c).join("");
}

// How many element-symbol-shaped chunks (one capital letter, optionally
// followed by one lowercase letter — Na, Cl, O, H, Mn, ...) appear in a
// formula fragment. Used below to guess whether a bare trailing digit is a
// subscript atom count or the charge's own magnitude.
function countElementSymbols(fragment: string): number {
  return fragment.match(/[A-Z][a-z]?/g)?.length ?? 0;
}

// A lone "+" is almost always the reactant/product separator ("A + B"),
// never a charge written on its own — everything else that's just an
// optional digit run and a sign (bare "-", "2-", "3+", ...) has no other
// reasonable meaning in a reaction and is always a charge.
function isBareSeparatorPlus(digits: string, signs: string): boolean {
  return !digits && (signs === "+" || signs === "⁺");
}

// Explicit charge markers — a caret ("Cr2O7^2-") or a space before the
// charge ("Cr2O7 2-") — are unambiguous, so they're resolved to their
// final superscript form immediately, before the harder no-marker case
// below ever sees them.
function resolveExplicitCharges(input: string): string {
  const withCaret = input.replace(
    new RegExp(`([A-Za-z0-9)\\]]+)\\^(\\d*)([${SIGN_CLASS}]+)`, "g"),
    (_match, base: string, digits: string, signs: string) =>
      base + toSuperscriptChars(digits) + toSuperscriptChars(signs)
  );

  return withCaret.replace(
    new RegExp(`([A-Za-z0-9)\\]]+)[ \\t]+(\\d*)([${SIGN_CLASS}]+)(?![A-Za-z])`, "g"),
    (match, base: string, digits: string, signs: string) =>
      isBareSeparatorPlus(digits, signs) ? match : base + toSuperscriptChars(digits) + toSuperscriptChars(signs)
  );
}

// The hard case: a digit immediately glued to a bare +/- with no caret or
// space at all — "Fe3+", "MnO4-", "NO3-", "e-". Real chemistry knowledge
// (is "Fe3" or "O4" the more sensible reading?) can't be recovered from
// text alone, so this falls back to a heuristic that happens to be right
// for every common ion: a single bare element symbol before the digit
// (Fe3+, Al3+, Na+, H+, Mn2+) means the digit is the charge's own
// magnitude; two or more symbols (MnO4-, NO3-, NH4+) means the trailing
// digit is a subscript atom count instead, with the charge left at its
// near-universal implicit magnitude of 1.
function formatGluedCharge(word: string): string {
  const match = word.match(new RegExp(`^(.*[A-Za-z)\\]])(\\d*)([${SIGN_CLASS}]+)$`));
  if (!match) return word;
  const [, base, digits, signs] = match;

  if (!digits || countElementSymbols(base) <= 1) {
    return base + toSuperscriptChars(digits) + toSuperscriptChars(signs);
  }
  return base + toSubscriptDigits(digits) + toSuperscriptChars(signs);
}

// Students (and the FastAPI solver) type plain text like "CH3COOH + NaOH
// -> ..." or ionic notation like "MnO4- + Fe2+ -> ... + Mn2+", "Cr2O7 2-"
// or "Cr2O7^2-", "e-". This renders all of it with proper subscripts,
// superscript charges, and a real arrow, without ever requiring the user
// to type special characters. Only digits immediately after a letter or
// ")" are subscripted, so leading stoichiometric coefficients (the "2" in
// "2H2O") are left as normal digits.
export function formatFormula(input: string): string {
  const withArrows = input.replace(/<-+>/g, "⇌").replace(/-+>/g, "→");
  const withExplicitCharges = resolveExplicitCharges(withArrows);

  // Only "words" that still end in an unresolved sign (bare ASCII +/-, or
  // a unicode superscript sign a button inserted right after a plain
  // digit) reach the ambiguous glued-charge case — anything the caret/space
  // pass above already resolved now has its digits superscripted too, so
  // this never re-matches it.
  const withGluedCharges = withExplicitCharges.replace(
    new RegExp(`[A-Za-z0-9)\\]]+[${SIGN_CLASS}]+`, "g"),
    formatGluedCharge
  );

  // Whatever plain digits are left are ordinary atom-count subscripts
  // that were never part of any charge at all (the "2" in "H2O").
  return withGluedCharges.replace(
    /([A-Za-z)])(\d+)/g,
    (_match, prefix: string, digits: string) => prefix + toSubscriptDigits(digits)
  );
}

// content-schema.json's documented convention for chapter body text is
// "CH~3~COOH" style tilde-delimited subscripts (its own _readme says
// "Formulas written as CH~3~COOH style ... rendered with proper
// subscripts"). This converts that markup, then also runs formatFormula()
// so any plain-digit formulas or ionic charges in the same text still get
// formatted correctly.
export function formatChapterText(input: string): string {
  return formatFormula(
    input.replace(/~(\d+)~/g, (_match, digits: string) => toSubscriptDigits(digits))
  );
}

// Cleans up the different ways a student might type charge notation into
// one canonical plain-text style before it's sent to the backend — the
// solver already understands all of these variants equally well, but a
// consistent shape is still worth sending. Caret markers ("Cr2O7^2-")
// become a space ("Cr2O7 2-"); runs of whitespace collapse to one space.
export function normalizeReactionInput(input: string): string {
  return input.replace(/\^/g, " ").replace(/[ \t]+/g, " ").trim();
}
