import type { ReactNode } from "react";

const STYLES = {
  note: "border-blue-200 bg-blue-50 text-blue-950",
  tip: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
} as const;

const LABELS = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
} as const;

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof STYLES;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={`not-prose my-6 rounded-lg border px-4 py-3 ${STYLES[type]}`}>
      <p className="mb-1 text-sm font-semibold">{title ?? LABELS[type]}</p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
