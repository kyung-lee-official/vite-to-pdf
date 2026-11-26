import type { ComponentType, ImgHTMLAttributes } from "react";
import { BarChart } from "../components/charts/BarChart";
import { TimelineChart } from "../components/charts/TimelineChart";
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
    TimelineChart,
    Callout,
  };
}
