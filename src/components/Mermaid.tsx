import { useEffect, useId, useRef } from "react";

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "strict",
        fontFamily:
          '"Segoe UI", "Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif',
        flowchart: { useMaxWidth: true },
        gantt: {
          useMaxWidth: true,
          fontSize: 18,
          sectionFontSize: 18,
          barHeight: 24,
          barGap: 6,
          leftPadding: 100,
          rightPadding: 140,
        },
      });
      const { svg } = await mermaid.render(`mermaid-${reactId}`, chart);
      if (!cancelled && ref.current) {
        ref.current.innerHTML = svg;
      }
    };

    void render().catch((error: unknown) => {
      if (!cancelled && ref.current) {
        ref.current.textContent =
          error instanceof Error ? error.message : String(error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <div
      ref={ref}
      className="mermaid not-prose my-6 flex justify-center overflow-x-auto"
    />
  );
}
