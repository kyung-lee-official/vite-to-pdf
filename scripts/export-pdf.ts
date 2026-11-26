import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import matter from "gray-matter";
import { chromium, type Page } from "playwright";
import sirv from "sirv";

type DocEntry = {
  slug: string;
  /** Path under doc/, without the extension; also the PDF path under build/. */
  relative: string;
  title: string;
  pdf: Record<string, unknown>;
};

const root = process.cwd();
const docDir = path.join(root, "doc");
const distDir = path.join(root, "dist");
const buildDir = path.join(root, "build");

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

if (!fs.existsSync(distDir)) {
  console.error("dist/ not found. Run `vite build` first.");
  process.exit(1);
}
fs.rmSync(buildDir, { recursive: true, force: true });
fs.mkdirSync(buildDir, { recursive: true });

const docs: DocEntry[] = walk(docDir)
  .map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    const relative = toPosix(path.relative(docDir, file)).replace(
      /\.(md|mdx)$/i,
      "",
    );
    const fallbackTitle = relative.split("/").pop() ?? relative;
    const title =
      typeof data.title === "string" && data.title.trim()
        ? data.title.trim()
        : fallbackTitle;
    const slug =
      typeof data.slug === "string" && data.slug.trim()
        ? data.slug.trim()
        : relative;
    const pdf =
      data.pdf && typeof data.pdf === "object"
        ? (data.pdf as Record<string, unknown>)
        : {};
    return { slug, relative, title, pdf };
  })
  .sort((a, b) => a.relative.localeCompare(b.relative));

const handler = sirv(distDir, { dev: false, single: false });
const server = http.createServer(handler);
await new Promise<void>((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

const address = server.address();
if (!address || typeof address === "string") {
  console.error("Could not determine the preview server port.");
  process.exit(1);
}

const base = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ channel: "chromium" });
const failures: string[] = [];

try {
  for (const doc of docs) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    try {
      await page.emulateMedia({ media: "print" });
      await page.goto(`${base}/#/report/${encodeURIComponent(doc.slug)}`, {
        waitUntil: "load",
      });
      await page.waitForFunction(
        () => document.body.dataset.reportReady === "true",
        null,
        { timeout: 30_000 },
      );
      await page.waitForFunction(
        () =>
          Array.from(document.images).every((image) => image.complete),
        null,
        { timeout: 15_000 },
      );

      const mermaidCount = await page.locator(".mermaid").count();
      if (mermaidCount > 0) {
        await page.waitForFunction(
          (count) =>
            document.querySelectorAll(".mermaid svg").length >= count,
          mermaidCount,
          { timeout: 20_000 },
        );
      }

      const pdfPath = path.join(buildDir, `${doc.relative}.pdf`);
      fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

      const options: Parameters<Page["pdf"]>[0] = {
        path: pdfPath,
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: "<div></div>",
        footerTemplate:
          '<div style="width:100%;padding:0 18mm;font-size:9px;color:#8b949e;text-align:right;">' +
          '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
        margin: {
          top: "18mm",
          right: "18mm",
          bottom: "20mm",
          left: "18mm",
        },
        ...(doc.pdf as Partial<Parameters<Page["pdf"]>[0]>),
      };

      await page.pdf(options);
      console.log(`  ${doc.relative} -> ${path.relative(root, pdfPath)}`);
    } catch (error) {
      failures.push(doc.relative);
      console.error(
        `  FAILED ${doc.relative}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length > 0) {
  console.error(`${failures.length} document(s) failed.`);
  process.exitCode = 1;
}
