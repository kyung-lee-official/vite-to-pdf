import type { ImgHTMLAttributes } from "react";
import { type Doc, resolveDocAsset } from "../lib/docs";

export function DocImage({
  doc,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { doc: Doc }) {
  const src =
    typeof props.src === "string"
      ? resolveDocAsset(doc.sourcePath, props.src)
      : props.src;
  return <img {...props} alt={props.alt ?? ""} src={src} />;
}
