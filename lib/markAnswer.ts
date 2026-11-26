import { API_URL } from "@/lib/apiUrl";
import type { MarkingPoint } from "@/lib/pastPapers";

// Matches api/main.py's MAX_STUDENT_ANSWER_LENGTH.
export const MAX_ANSWER_LENGTH = 2000;

export type AiMarkedPoint = {
  point: string | null;
  max_marks: number;
  awarded_marks: number;
  reason: string;
  branch: number;
};

export type AiMarkResult = {
  points: AiMarkedPoint[];
  // Honest score: best OR branch, never above max_marks.
  total_awarded: number;
  max_marks: number;
  // +1 encouragement on a partly right answer (capped at full marks),
  // reported separately from the honest total.
  practice_bonus: number;
  practice_total: number;
  feedback: string;
  caution_notes: string[];
};

// Render's free tier sleeps the API after inactivity and the first request
// can take ~50s to wake it, so the client waits well past that before
// giving up.
const TIMEOUT_MS = 90_000;

export async function markAnswer(input: {
  questionText: string;
  marks: number;
  markingPoints: MarkingPoint[];
  studentAnswer: string;
}): Promise<AiMarkResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/mark-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_text: input.questionText,
        marks: input.marks,
        marking_points: input.markingPoints,
        student_answer: input.studentAnswer,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const detail = typeof body?.detail === "string" ? body.detail : null;
      throw new Error(detail ?? "Something went wrong while marking. Please try again.");
    }
    return (await res.json()) as AiMarkResult;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("The marking server took too long to respond. Please try again.");
    }
    if (err instanceof TypeError) {
      throw new Error("Couldn't reach the marking server. Check your connection and try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
