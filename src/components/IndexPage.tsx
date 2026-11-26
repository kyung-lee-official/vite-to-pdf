import { useEffect } from "react";
import { docs } from "../lib/docs";

export function IndexPage() {
  useEffect(() => {
    document.title = "Documents";
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Markdown and MDX reports. Open a document to preview it, or run{" "}
          <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-sm">
            bun run pdf
          </code>{" "}
          to export every document to <code>build/</code> with Playwright.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {docs.map((doc) => {
          const meta = [doc.frontmatter.version, doc.frontmatter.date]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={doc.slug}>
              <a
                className="block h-full rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
                href={`#/report/${encodeURIComponent(doc.slug)}`}
              >
                <span className="block text-base font-medium text-neutral-900">
                  {doc.title}
                </span>
                <span className="mt-1 block truncate text-xs text-neutral-500">
                  {doc.relativePath}
                </span>
                {meta ? (
                  <span className="mt-3 block text-xs text-neutral-400">
                    {meta}
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>

      {docs.length === 0 ? (
        <p className="mt-8 text-neutral-600">
          Add a Markdown or MDX file under <code>doc/</code> to get started.
        </p>
      ) : null}
    </main>
  );
}
