const SUBSCRIPT_DIGITS: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
};

// Students (and, later, the FastAPI solver) type plain text like
// "CH3COOH + NaOH -> ...". This renders it with proper subscripts and a
// real arrow without ever requiring the user to type special characters.
// Only digits immediately after a letter or ")" are subscripted, so leading
// stoichiometric coefficients (the "2" in "2H2O") are left as normal digits.
export function formatFormula(input: string): string {
  return input
    .replace(/-+>/g, "→")
    .replace(/([A-Za-z)])(\d+)/g, (_match, prefix: string, digits: string) =>
      prefix + digits.split("").map((d) => SUBSCRIPT_DIGITS[d] ?? d).join("")
    );
}
