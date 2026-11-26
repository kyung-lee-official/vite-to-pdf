# md-to-pdf

A small report workspace: Markdown and MDX in `doc/`, rendered with Vite + React + Tailwind, previewed in the browser, and exported to PDF with Playwright.

The PDF output is deterministic (A4, fixed margins, page numbers) and runs headlessly, so it works in CI. The browser's **Print / Save as PDF** button is available for quick checks, but the scripted export is the source of truth.

## Requirements

- Node.js >= 22 (or Bun)
- Chromium for Playwright: `bun run pdf:install`

## Usage

```sh
bun install

bun run dev       # preview at http://localhost:5173
bun run build     # static site in dist/
bun run pdf       # build + export every doc to build/
bun run typecheck
```

## Writing a document

Add a `.md` or `.mdx` file under `doc/`. The URL and PDF path are derived from the file path, so `doc/example/charts.mdx` becomes `#/report/example%2Fcharts` and `build/example/charts.pdf`.

Front matter is optional:

```yaml
---
title: Project closure
slug: project-closure
subtitle: Optional subtitle
date: 2026-11-26
version: v1.0
author: Li Geng
pdf:
  format: A4
  landscape: false
---
```

- `title` defaults to the file name.
- `slug` overrides the URL only; the PDF keeps the source path under `build/`.
- `pdf` is merged into Playwright's `page.pdf()` options for that document.
- Markdown features: GFM tables, task lists, images, KaTeX (`$...$`, `$$...$$`, `\(...\)`, `\[...\]`).

Images referenced with a relative path are resolved against the document's folder, so they keep working in dev and in the build. Keep assets next to the document or under `public/` for absolute `/...` paths.

## Components

MDX documents can use the components registered in `src/lib/mdx-components.tsx`:

### Mermaid

```mdx
<Mermaid chart={`gantt
    title Delivery plan
    dateFormat YYYY-MM-DD
    section Plan
    Build :done, a1, 2026-11-11, 2026-11-16
`} />
```

### Timeline (SVG, no image asset)

```mdx
<TimelineChart
  title="Delivery timeline"
  subtitle="Plan vs actual"
  start="2026-11-11"
  end="2026-11-26"
  rows={[
    { label: "Plan", bars: [{ start: "2026-11-11", end: "2026-11-16", label: "Build" }] },
    { label: "Actual", bars: [{ start: "2026-11-11", end: "2026-11-23", label: "Build and deploy" }] },
  ]}
  milestones={[
    { date: "2026-11-11", label: "Kickoff" },
    { date: "2026-11-26", label: "Sign-off", color: "#16a34a" },
  ]}
  delay={{ start: "2026-11-17", end: "2026-11-26", label: "Delay" }}
  caption="Figure: plan vs actual."
/>
```

Use `rows` for lanes, `milestones` for date markers, `delay` for the shaded slip range, and `legend` for swatches. The chart is inline SVG, so there is no image asset to keep in sync.

### Bar chart (Recharts)

```mdx
<BarChart
  title="Weekly throughput"
  xKey="week"
  series={[
    { key: "planned", name: "Planned", color: "#bfdbfe" },
    { key: "done", name: "Done", color: "#2563eb" },
  ]}
  data={[
    { week: "W1", planned: 15, done: 12 },
    { week: "W2", planned: 18, done: 18 },
  ]}
/>
```

### Callout

```mdx
<Callout type="tip" title="Note">
  Markdown prose and React components can be mixed.
</Callout>
```

Add more components under `src/components/` and register them in `src/lib/mdx-components.tsx`.

## PDF export

`bun run pdf` builds the site, starts a local static server, and prints each document through `scripts/export-pdf.ts`:

- A4, 18 mm side margins, 20 mm bottom margin;
- background colors and images enabled;
- page numbers in the footer;
- each document waits for fonts, images, Mermaid SVGs, and Recharts before printing;
- per-document `pdf` front matter overrides the defaults.

`doc/*` is gitignored by default, so business documents stay local. `doc/example` is tracked and is the place to add reusable examples.

## Project layout

```text
doc/                    Markdown / MDX documents (mostly local, example tracked)
src/App.tsx             hash router: index and report pages
src/lib/docs.ts         import.meta.glob for documents and assets
src/components/         report layout, Mermaid, charts, callout
src/styles/index.css    Tailwind, prose and print rules
scripts/export-pdf.ts   Playwright PDF exporter
build/                  generated PDFs
dist/                   generated static site
```
