import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/**
 * remark-math only understands `$...$` and `$$...$$`. The previous
 * markdown-it pipeline also accepted `\(...\)` and `\[...\]`, so normalize
 * those delimiters in the source before MDX parses the document.
 */
function mdxMathDelimiters(): Plugin {
  return {
    name: "mdx-math-delimiters",
    enforce: "pre",
    transform(code, id) {
      if (!/\.mdx?$/i.test(id) || id.includes("/node_modules/")) {
        return null;
      }
      /* Keep code spans and fenced blocks untouched. */
      const parts = code.split(
        /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g,
      );
      let changed = false;
      const next = parts
        .map((part, index) => {
          if (index % 2 === 1) {
            return part;
          }
          const replaced = part
            .replace(
              /\\\((.+?)\\\)/gs,
              (_: string, inner: string) => `$${inner}$`,
            )
            .replace(
              /\\\[(.+?)\\\]/gs,
              (_: string, inner: string) => `$$${inner}$$`,
            );
          if (replaced !== part) {
            changed = true;
          }
          return replaced;
        })
        .join("");
      return changed ? { code: next, map: null } : null;
    },
  };
}

export default defineConfig({
  plugins: [
    mdxMathDelimiters(),
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          remarkMdxFrontmatter,
          remarkGfm,
          remarkMath,
        ],
        rehypePlugins: [rehypeKatex],
      }),
    },
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "dist",
  },
});
