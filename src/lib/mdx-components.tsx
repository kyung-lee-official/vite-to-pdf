import type { ComponentType, ImgHTMLAttributes } from "react";
import { BarChart } from "../components/charts/BarChart";
import { Callout } from "../components/Callout";
import { DocImage } from "../components/DocImage";
import { Mermaid } from "../components/Mermaid";
import type { Doc } from "./docs";

export function createMdxComponents(
  doc: Doc,
): Record<string, ComponentType<any>> {
  return {
    img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
      <DocImage doc={doc} {...props} />
    ),
    Mermaid,
    BarChart,
    Callout,
  };
}
