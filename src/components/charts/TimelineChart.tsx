import { useId } from "react";

const VIEW_WIDTH = 800;
const CHART_LEFT = 130;
const CHART_RIGHT = 770;
const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;
const DAY_MS = 86_400_000;
const FONT_FAMILY =
  '"Segoe UI", "Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif';

export type TimelineBar = {
  start: string;
  /** Inclusive end date, in YYYY-MM-DD. */
  end: string;
  label?: string;
  color?: string;
  textColor?: string;
  strokeColor?: string;
};

export type TimelineRow = {
  label: string;
  bars: TimelineBar[];
};

export type TimelineMilestone = {
  date: string;
  label: string;
  color?: string;
};

export type TimelineDelay = {
  start: string;
  end: string;
  label: string;
};

export type TimelineLegendItem = {
  label: string;
  color: string;
  strokeColor?: string;
};

export type TimelineChartProps = {
  /** Optional heading inside the SVG; the figure is captioned instead when omitted. */
  title?: string;
  subtitle?: string;
  /** First day of the axis, in YYYY-MM-DD. */
  start: string;
  /** Last day of the axis, in YYYY-MM-DD. */
  end: string;
  rows: TimelineRow[];
  milestones?: TimelineMilestone[];
  delay?: TimelineDelay;
  legend?: TimelineLegendItem[];
  caption?: string;
};

function startOfDay(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return Number.NaN;
  }
  return Date.UTC(year, month - 1, day);
}

function dayOffset(value: string, start: number): number {
  return Math.round((startOfDay(value) - start) / DAY_MS);
}

function dateLabel(ms: number): string {
  return new Date(ms).toISOString().slice(5, 10);
}

export function TimelineChart({
  title,
  subtitle,
  start,
  end,
  rows,
  milestones = [],
  delay,
  legend = [],
  caption,
}: TimelineChartProps) {
  const titleId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const startMs = startOfDay(start);
  const endMs = startOfDay(end);
  const totalDays = Math.max(1, Math.round((endMs - startMs) / DAY_MS));
  const x = (offset: number) =>
    CHART_LEFT + (Math.max(0, Math.min(totalDays, offset)) / totalDays) * CHART_WIDTH;

  const hasHeader = Boolean(title) || Boolean(subtitle);
  const headerHeight = hasHeader ? (subtitle ? 72 : 52) : 12;
  const tickY = headerHeight + 6;
  const axisY = headerHeight + 16;
  const bandTop = headerHeight + 32;
  const bandLabelY = headerHeight + 48;
  const rowTop = headerHeight + 58;
  const rowGap = 50;
  const barHeight = 32;
  const milestoneY = rowTop + rows.length * rowGap + 15;
  const chartBottom = milestoneY + 42;
  const height = chartBottom + 24;

  const tickStep = totalDays > 10 ? 5 : 1;
  const tickDays: number[] = [];
  for (let day = 0; day <= totalDays; day += tickStep) {
    tickDays.push(day);
  }
  if (tickDays[tickDays.length - 1] !== totalDays) {
    tickDays.push(totalDays);
  }

  const delayStart = delay
    ? Math.max(0, Math.min(totalDays, dayOffset(delay.start, startMs)))
    : 0;
  const delayEnd = delay
    ? Math.max(
        delayStart,
        Math.min(totalDays, dayOffset(delay.end, startMs) + 1),
      )
    : 0;

  return (
    <figure className="not-prose my-6">
      <svg
        aria-labelledby={titleId}
        className="h-auto w-full"
        height={height}
        role="img"
        viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
        width={VIEW_WIDTH}
      >
        <title id={titleId}>{title ?? caption ?? "Timeline"}</title>
        {subtitle ? <desc>{subtitle}</desc> : null}

        {title ? (
          <text
            fill="#1f2328"
            fontFamily={FONT_FAMILY}
            fontSize={24}
            fontWeight={700}
            x={24}
            y={36}
          >
            {title}
          </text>
        ) : null}
        {subtitle ? (
          <text
            fill="#57606a"
            fontFamily={FONT_FAMILY}
            fontSize={14}
            x={24}
            y={title ? 56 : 40}
          >
            {subtitle}
          </text>
        ) : null}

        {Array.from({ length: totalDays + 1 }, (_, day) => {
          const cx = x(day);
          const major = tickDays.includes(day);
          return (
            <line
              key={`grid-${day}`}
              stroke={major ? "#d8dee4" : "#eaeef2"}
              strokeDasharray={major ? "3 4" : undefined}
              strokeWidth={1}
              x1={cx}
              x2={cx}
              y1={axisY}
              y2={chartBottom}
            />
          );
        })}

        <line
          stroke="#d0d7de"
          strokeWidth={1}
          x1={CHART_LEFT}
          x2={CHART_RIGHT}
          y1={axisY}
          y2={axisY}
        />

        {tickDays.map((day) => {
          const cx = x(day);
          const last = day === totalDays;
          return (
            <text
              key={`tick-${day}`}
              fill="#57606a"
              fontFamily={FONT_FAMILY}
              fontSize={13}
              textAnchor={last ? "end" : "middle"}
              x={last ? cx - 2 : cx}
              y={tickY}
            >
              {dateLabel(startMs + day * DAY_MS)}
            </text>
          );
        })}

        {delay && delayEnd > delayStart ? (
          <>
            <rect
              fill="#fff1f2"
              height={chartBottom - bandTop}
              stroke="#fecdd3"
              strokeDasharray="4 4"
              strokeWidth={1}
              width={x(delayEnd) - x(delayStart)}
              x={x(delayStart)}
              y={bandTop}
            />
            <text
              fill="#b91c1c"
              fontFamily={FONT_FAMILY}
              fontSize={14}
              fontWeight={600}
              x={x(delayStart) + 8}
              y={bandLabelY}
            >
              {delay.label}
            </text>
          </>
        ) : null}

        {milestones.map((milestone, index) => {
          const offset = Math.max(
            0,
            Math.min(totalDays, dayOffset(milestone.date, startMs)),
          );
          const cx = x(offset);
          return (
            <line
              key={`milestone-line-${milestone.date}-${index}`}
              stroke="#e5e7eb"
              strokeDasharray="2 4"
              strokeWidth={1}
              x1={cx}
              x2={cx}
              y1={bandTop + 4}
              y2={chartBottom}
            />
          );
        })}

        {rows.map((row, rowIndex) => {
          const y = rowTop + rowIndex * rowGap;
          return (
            <g key={row.label}>
              <text
                fill="#1f2328"
                fontFamily={FONT_FAMILY}
                fontSize={18}
                fontWeight={600}
                x={24}
                y={y + 22}
              >
                {row.label}
              </text>
              {row.bars.map((bar, barIndex) => {
                const startOffset = Math.max(
                  0,
                  Math.min(totalDays, dayOffset(bar.start, startMs)),
                );
                const endOffset = Math.max(
                  startOffset + 1,
                  Math.min(totalDays, dayOffset(bar.end, startMs) + 1),
                );
                const barX = x(startOffset) + 4;
                const barWidth = Math.max(8, x(endOffset) - x(startOffset) - 8);
                return (
                  <g key={`${bar.start}-${bar.end}-${barIndex}`}>
                    {bar.label ? <title>{bar.label}</title> : null}
                    <rect
                      fill={bar.color ?? "#2563eb"}
                      height={barHeight}
                      rx={6}
                      stroke={bar.strokeColor}
                      width={barWidth}
                      x={barX}
                      y={y}
                    />
                    {bar.label ? (
                      <text
                        fill={bar.textColor ?? "#ffffff"}
                        fontFamily={FONT_FAMILY}
                        fontSize={15}
                        fontWeight={600}
                        x={barX + 10}
                        y={y + 21}
                      >
                        {bar.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          );
        })}

        {milestones.map((milestone, index) => {
          const offset = Math.max(
            0,
            Math.min(totalDays, dayOffset(milestone.date, startMs)),
          );
          const cx = x(offset);
          const anchor =
            index === 0 ? "start" : offset === totalDays ? "end" : "middle";
          const textX =
            anchor === "start" ? cx + 4 : anchor === "end" ? cx - 4 : cx;
          return (
            <g key={`milestone-${milestone.date}-${index}`}>
              <circle
                cx={cx}
                cy={milestoneY}
                fill={milestone.color ?? "#1d4ed8"}
                r={5}
              />
              <text
                fill="#57606a"
                fontFamily={FONT_FAMILY}
                fontSize={13}
                textAnchor={anchor}
                x={textX}
                y={milestoneY + 21}
              >
                {milestone.label}
              </text>
            </g>
          );
        })}
      </svg>

      {legend.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
          {legend.map((item) => (
            <span className="inline-flex items-center gap-2" key={item.label}>
              <span
                className="inline-block size-3 rounded-sm border"
                style={{
                  backgroundColor: item.color,
                  borderColor: item.strokeColor ?? item.color,
                }}
              />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}

      {caption ? (
        <figcaption className="mt-3 border-l-2 border-neutral-300 pl-3 text-sm text-neutral-500">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
