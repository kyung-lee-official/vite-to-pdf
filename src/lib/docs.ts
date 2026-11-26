import type { ComponentType } from "react";

export type DocFrontmatter = {
  title?: string;
  subtitle?: string;
  slug?: string;
  date?: string;
  version?: string;
  author?: string;
  status?: string;
  pdf?: Record<string, unknown>;
};

type MdxModule = {
  default: ComponentType<{ components?: Record<string, ComponentType<any>> }>;
  frontmatter?: DocFrontmatter;
};

export type Doc = {
  /** Stable identifier used in the URL and as the PDF file name. */
  slug: string;
  title: string;
  /** Path relative to `doc/`, without the extension. */
  relativePath: string;
  /** Vite module id, for example `/doc/example/mathjax.md`. */
  sourcePath: string;
  /** Directory of the source document, for resolving relative assets. */
  dir: string;
  frontmatter: DocFrontmatter;
  Content: ComponentType<{ components?: Record<string, ComponentType<any>> }>;
};

const modules = import.meta.glob("/doc/**/*.{md,mdx}", {
  eager: true,
}) as Record<string, MdxModule>;

const assets = import.meta.glob(
  "/doc/**/*.{svg,png,jpg,jpeg,webp,gif}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

export const docs: Doc[] = Object.entries(modules)
  .map(([sourcePath, mod]) => {
    const relativePath = sourcePath
      .replace(/^\/doc\//, "")
      .replace(/\.(md|mdx)$/i, "");
    const frontmatter = mod.frontmatter ?? {};
    const fallbackTitle = relativePath.split("/").pop() ?? relativePath;
    const dir = sourcePath.slice(0, sourcePath.lastIndexOf("/"));
    return {
      slug: frontmatter.slug?.trim() || relativePath,
      title: frontmatter.title?.trim() || fallbackTitle,
      relativePath,
      sourcePath,
      dir,
      frontmatter,
      Content: mod.default,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));

export function findDoc(slug: string): Doc | undefined {
  return docs.find((doc) => doc.slug === slug);
}

/**
 * Resolve an image referenced from an MDX document. Relative paths are looked
 * up in the Vite asset graph so they work in dev and in the production build.
 */
export function resolveDocAsset(sourcePath: string, src: string): string {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(src)) {
    return src;
  }

  const dir = sourcePath.slice(0, sourcePath.lastIndexOf("/"));
  const url = new URL(src, `file://${dir}/`);
  const key = decodeURIComponent(url.pathname);
  return assets[key] ?? src;
}
