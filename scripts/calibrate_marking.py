"""Check the /mark-answer AI marker against your own marks.

Usage:
    python scripts/calibrate_marking.py answers.json
    python scripts/calibrate_marking.py answers.json --api https://<your-render-app>.onrender.com
    python scripts/calibrate_marking.py answers.json --tolerance 0.5

answers.json is a list of test answers with the marks you would give:

    [
      {
        "question_id": "cbse10-2023-main-31-4-1-q28",
        "student_answer": "(i) Add acid to water slowly ...",
        "expected_marks": 2.5,
        "note": "optional, printed next to the result"
      }
    ]

question_id is an id from content/questions/class10/*.json; the question
text, marks and marking points are read from there, exactly as the
/past-papers page sends them. See scripts/calibration_answers.example.json.

For each answer this prints the AI's honest total (not the practice mark)
next to yours, and the per-point breakdown wherever the two differ by more
than --tolerance. A summary at the end shows how often they agree.
"""

import argparse
import glob
import json
import os
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS_GLOB = os.path.join(ROOT, "content", "questions", "class10", "*.json")

# The API allows 10 requests per minute per IP; stay just under it.
SECONDS_BETWEEN_CALLS = 6.5


def load_questions() -> dict:
    questions = {}
    for path in sorted(glob.glob(QUESTIONS_GLOB)):
        with open(path, encoding="utf-8") as fh:
            for q in json.load(fh)["questions"]:
                questions[q["id"]] = q
    return questions


def call_api(api: str, q: dict, answer: str, retries: int = 3) -> dict:
    body = json.dumps(
        {
            "question_text": q["question_text"],
            "marks": q["marks"],
            "marking_points": q["marking_points"],
            "student_answer": answer,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{api.rstrip('/')}/mark-answer", data=body, headers={"Content-Type": "application/json"}
    )
    for attempt in range(retries):
        try:
            # Generous timeout: a sleeping Render instance takes ~50s to wake.
            with urllib.request.urlopen(req, timeout=120) as res:
                return json.load(res)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")
            if exc.code == 429 and attempt < retries - 1:
                time.sleep(61)
                continue
            raise RuntimeError(f"HTTP {exc.code}: {detail}") from exc
    raise RuntimeError("gave up after repeated rate limiting")


def fmt(n: float) -> str:
    return f"{n:g}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("answers", help="JSON file of test answers with expected marks")
    parser.add_argument(
        "--api",
        default=os.environ.get("NEXT_PUBLIC_API_URL", "http://localhost:8000"),
        help="API base URL (default: $NEXT_PUBLIC_API_URL or http://localhost:8000)",
    )
    parser.add_argument(
        "--tolerance",
        type=float,
        default=0.0,
        help="ignore differences up to this many marks (default 0: any difference counts)",
    )
    args = parser.parse_args()

    with open(args.answers, encoding="utf-8") as fh:
        cases = json.load(fh)
    questions = load_questions()

    agree = over = under = errors = 0
    abs_diff_total = 0.0
    marked = 0

    for i, case in enumerate(cases, 1):
        qid = case.get("question_id")
        q = questions.get(qid)
        label = f"[{i}/{len(cases)}] {qid}"
        if not q:
            print(f"{label}: unknown question_id, skipped")
            errors += 1
            continue
        if not q.get("marking_points"):
            print(f"{label}: has no marking points (MCQ or no scheme), skipped")
            errors += 1
            continue
        expected = float(case["expected_marks"])
        try:
            result = call_api(args.api, q, case["student_answer"])
        except Exception as exc:  # report and keep going
            print(f"{label}: ERROR {exc}")
            errors += 1
            continue

        ai = float(result["total_awarded"])
        diff = ai - expected
        marked += 1
        abs_diff_total += abs(diff)
        note = f"  ({case['note']})" if case.get("note") else ""

        if abs(diff) <= args.tolerance:
            agree += 1
            print(f"{label}: OK   you {fmt(expected)} / AI {fmt(ai)} of {fmt(q['marks'])}{note}")
        else:
            if diff > 0:
                over += 1
                verdict = f"AI GAVE {fmt(diff)} MORE"
            else:
                under += 1
                verdict = f"AI GAVE {fmt(-diff)} LESS"
            print(f"{label}: DIFF you {fmt(expected)} / AI {fmt(ai)} of {fmt(q['marks'])} -> {verdict}{note}")
            for p in result["points"]:
                text = " ".join((p.get("point") or "(drawn in scheme)").split())
                print(
                    f"      branch {p['branch']}  {fmt(p['awarded_marks'])}/{fmt(p['max_marks'])}  "
                    f"{text[:70]}\n        why: {p['reason']}"
                )

        if i < len(cases):
            time.sleep(SECONDS_BETWEEN_CALLS)

    print()
    print(f"Marked {marked} of {len(cases)} answers ({errors} skipped or failed).")
    if marked:
        print(f"Agree: {agree}   AI higher: {over}   AI lower: {under}")
        print(f"Agreement: {agree / marked:.0%}   Mean absolute difference: {abs_diff_total / marked:.2f} marks")
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
