"use client";

import ReactMarkdown from "react-markdown";
import { formatFormula } from "@/lib/formatFormula";
import { convertScientificNotation } from "@/lib/scientificNotation";

// Shared renderer for every AI-generated answer in the app (Ask a Doubt,
// the reaction solver, the molecule identifier, generated quiz
// explanations, smart search) — these come back as Markdown-ish prose
// (**bold** labels, lists, the odd heading) plus inline chemistry/scientific
// notation ("H2O", "Fe3+", "10^23", "N_A"), and previously all of that was
// dumped into a plain <p> as literal text. This renders the Markdown for
// real and converts both notations to proper Unicode sub/superscripts
// before handing text to the Markdown parser, styled to match the app's
// dark theme instead of prose's light-mode defaults.
export default function MarkdownAnswer({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const processed = convertScientificNotation(formatFormula(text));

  return (
    <div className={`text-sm leading-relaxed text-text-dim ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
          em: ({ children }) => <em className="italic text-text">{children}</em>,
          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h3 className="mb-1 mt-3 text-sm font-bold text-text first:mt-0">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-1 mt-3 text-sm font-bold text-text first:mt-0">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-1 mt-3 text-sm font-semibold text-text first:mt-0">{children}</h4>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface-2 px-1 py-0.5 text-xs text-accent-2">{children}</code>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-accent-2 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent/40 pl-3 text-text-dim">{children}</blockquote>
          ),
          hr: () => <hr className="my-3 border-border" />,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
