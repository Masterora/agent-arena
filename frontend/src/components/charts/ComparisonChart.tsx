import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { MatchParticipant } from "../../types/match";
import styles from "./Chart.module.css";

interface ComparisonChartProps {
  participants: MatchParticipant[];
}

const TOOLTIP_STYLE = {
  background: "#0d1426",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  color: "#94a3b8",
  fontSize: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
  padding: "10px 14px",
};

const getBarColor = (value: number) => {
  if (value >= 5)  return "#10b981";
  if (value >= 0)  return "#22d3ee";
  if (value >= -5) return "#f59e0b";
  return "#fb7185";
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  participants,
}) => {
  const data = [...participants]
    .sort((a, b) => (b.return_pct || 0) - (a.return_pct || 0))
    .map((p) => ({
      name: p.strategy_name || "未知策略",
      return: p.return_pct || 0,
    }));

  return (
    <div className={styles.container}>
      <p className={styles.title}>策略收益对比</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="1 4" stroke="rgba(148,163,184,0.07)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Number(v) > 0 ? "+" : ""}${Number(v).toFixed(1)}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <ReferenceLine x={0} stroke="rgba(148,163,184,0.2)" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "#475569", marginBottom: "4px", fontSize: "11px" }}
            wrapperStyle={{ outline: "none" }}
            cursor={{ fill: "rgba(34,211,238,0.04)" }}
            formatter={(value: number | undefined) => [
              `${(value ?? 0) > 0 ? "+" : ""}${(value ?? 0).toFixed(2)}%`,
              "收益率",
            ]}
          />
          <Bar dataKey="return" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.return)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
