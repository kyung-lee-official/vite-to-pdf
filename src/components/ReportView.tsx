import { useEffect, useMemo } from "react";
import type { Doc } from "../lib/docs";
import { createMdxComponents } from "../lib/mdx-components";

export function ReportView({ doc }: { doc: Doc }) {
  const Content = doc.Content;
  const components = useMemo(() => createMdxComponents(doc), [doc]);

  useEffect(() => {
    document.title = doc.title;
    document.body.dataset.reportReady = "false";
    let cancelled = false;

    const markReady = async () => {
      await document.fonts.ready;
      /* Give Recharts one layout frame before the PDF exporter starts. */
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      if (!cancelled) {
        document.body.dataset.reportReady = "true";
      }
    };

    void markReady();
    return () => {
      cancelled = true;
      delete document.body.dataset.reportReady;
    };
  }, [doc]);

  const meta = [
    doc.frontmatter.version,
    doc.frontmatter.date,
    doc.frontmatter.author,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-neutral-200/60 print:bg-white">
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3">
          <a
            className="shrink-0 text-sm text-neutral-600 hover:text-neutral-900"
            href="#/"
          >
            ← All documents
          </a>
          <span className="truncate text-sm font-medium">{doc.title}</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden max-w-64 truncate text-xs text-neutral-400 sm:inline">
              {doc.relativePath}
            </span>
            <button
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
              onClick={() => window.print()}
              type="button"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      <main className="report-page mx-auto my-8 max-w-4xl bg-white px-12 py-14 shadow-sm print:my-0 print:max-w-none print:px-0 print:py-0 print:shadow-none">
        {meta.length > 0 ? (
          <p className="mb-6 text-sm text-neutral-500">{meta.join(" · ")}</p>
        ) : null}
        <article className="report-prose prose prose-neutral max-w-none">
          <Content components={components} />
        </article>
      </main>
    </div>
  );
}
