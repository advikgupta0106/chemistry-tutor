export type SolveResult = {
  answer: string;
  explanation: string;
  reaction_type: string;
  confidence: "High" | "Medium" | "Low";
};

// Placeholder for the future FastAPI backend (see CLAUDE.md: "All solver
// calls go to the FastAPI backend — no chemistry logic in the frontend").
// Same response shape that endpoint will return, so swapping this out later
// is a one-function change.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept to document the real endpoint's signature
export async function solveReaction(_reaction: string): Promise<SolveResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    answer: "CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂",
    explanation:
      "Acetic acid reacts with sodium bicarbonate to form sodium acetate, water and carbon dioxide.",
    reaction_type: "Acid-Base Reaction",
    confidence: "High",
  };
}
