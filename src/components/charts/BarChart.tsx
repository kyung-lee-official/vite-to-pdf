import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartSeries = {
  key: string;
  name: string;
  color?: string;
};

export type ChartRow = Record<string, string | number>;

const DEFAULT_COLORS = ["#2563eb", "#0ea5e9", "#f59e0b", "#16a34a", "#dc2626"];

export function BarChart({
  data,
  xKey,
  series,
  height = 320,
  title,
  caption,
  yUnit,
}: {
  data: ChartRow[];
  xKey: string;
  series: ChartSeries[];
  height?: number;
  title?: string;
  caption?: string;
  yUnit?: string;
}) {
  return (
    <figure className="not-prose my-6">
      {title ? (
        <figcaption className="mb-2 text-sm font-medium text-neutral-700">
          {title}
        </figcaption>
      ) : null}
      <div style={{ height }}>
        <ResponsiveContainer height="100%" width="100%">
          <RechartsBarChart data={data}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              unit={yUnit}
              width={yUnit ? 56 : 40}
            />
            <Tooltip />
            <Legend />
            {series.map((entry, index) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                isAnimationActive={false}
                name={entry.name}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-xs text-neutral-500">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
