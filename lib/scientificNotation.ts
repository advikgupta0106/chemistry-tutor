import { SUBSCRIPT_DIGITS, SUPERSCRIPT_DIGITS, SUPERSCRIPT_SIGNS } from "@/lib/formatFormula";

// Real Unicode has proper subscript/superscript glyphs for digits and a
// handful of lowercase letters, but no subscript form for uppercase letters
// at all. The small-capital-letter block is the closest visual stand-in for
// those (e.g. the "A" in "N_A") — not a true subscript, but the same
// pragmatic choice most plain-text/unicode-only renderings make.
const SUBSCRIPT_LOWERCASE: Record<string, string> = {
  a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
  n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
};

// No true small-capital glyph exists for "q" or "x" in Unicode — those two
// are simply absent here and fall through to the original character.
const SMALL_CAPS: Record<string, string> = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ",
  i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ",
  r: "ʀ", s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ",
  y: "ʏ", z: "ᴢ",
};

const SUPERSCRIPT_LOWERCASE: Record<string, string> = {
  a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ",
  i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ",
  r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
};

function toSubscriptRun(run: string): string {
  return run
    .split("")
    .map((c) => {
      if (SUBSCRIPT_DIGITS[c]) return SUBSCRIPT_DIGITS[c];
      const lower = c.toLowerCase();
      if (c === lower && SUBSCRIPT_LOWERCASE[lower]) return SUBSCRIPT_LOWERCASE[lower];
      // Uppercase, or a lowercase letter with no real subscript glyph
      // (b, c, d, f, g, q, w, y, z) — fall back to small caps rather than
      // leaving it unconverted, or leave truly unmappable characters as-is.
      return SMALL_CAPS[lower] ?? c;
    })
    .join("");
}

function toSuperscriptRun(run: string): string {
  return run
    .split("")
    .map((c) => {
      if (SUPERSCRIPT_DIGITS[c]) return SUPERSCRIPT_DIGITS[c];
      if (SUPERSCRIPT_SIGNS[c]) return SUPERSCRIPT_SIGNS[c];
      const lower = c.toLowerCase();
      if (c === lower && SUPERSCRIPT_LOWERCASE[lower]) return SUPERSCRIPT_LOWERCASE[lower];
      return c;
    })
    .join("");
}

// Converts the "^"/"_" scientific notation an LLM commonly writes in prose
// (10^23, N_A, K_a, x^2, E^{-1}) into real Unicode superscripts/subscripts,
// for text that isn't itself a chemical formula (formatFormula already
// handles those — "H2O", "Fe3+" — from bare digits with no marker at all).
//
// The bare (unbraced) patterns require a preceding alphanumeric character
// with no space ("N_A", not "an _italic_ word") specifically so this never
// touches genuine Markdown emphasis: CommonMark disables "_" as an emphasis
// marker intraword, so "N_A" was never valid italics syntax to begin with.
export function convertScientificNotation(input: string): string {
  const withBracedSuper = input.replace(/\^\{([^{}]+)\}/g, (_m, run: string) => toSuperscriptRun(run));
  const withBracedSub = withBracedSuper.replace(/_\{([^{}]+)\}/g, (_m, run: string) => toSubscriptRun(run));

  const withBareSuper = withBracedSub.replace(
    /([A-Za-z0-9])\^([A-Za-z0-9+-]+)/g,
    (_m, base: string, run: string) => base + toSuperscriptRun(run)
  );

  return withBareSuper.replace(
    /([A-Za-z0-9])_([A-Za-z0-9]+)/g,
    (_m, base: string, run: string) => base + toSubscriptRun(run)
  );
}
