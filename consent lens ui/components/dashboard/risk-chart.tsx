"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Tracking", value: 42 },
  { name: "Data Sharing", value: 68 },
  { name: "Retention", value: 25 },
  { name: "Third Party", value: 55 },
  { name: "Consent", value: 18 },
];

const colors = ["#7c5cfc", "#6366f1", "#a78bfa", "#22d3ee", "#2dd4bf"];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-subtle rounded-lg px-3 py-2">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-[13px] font-semibold text-foreground">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
}

export function RiskChart() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="mb-6 text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
        Risk Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={32}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b6b80", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b6b80", fontSize: 11 }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
