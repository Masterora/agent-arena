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
} from "recharts";
import type { Strategy } from "../../types/strategy";
import styles from "./StrategyStatsChart.module.css";

interface StrategyStatsChartProps {
  strategies: Strategy[];
}

export const StrategyStatsChart: React.FC<StrategyStatsChartProps> = ({
  strategies,
}) => {
  const data = strategies
    .filter((s) => s.total_matches > 0)
    .sort((a, b) => b.avg_return - a.avg_return)
    .slice(0, 10)
    .map((s) => ({
      name: s.name,
      avgReturn: s.avg_return,
      winRate: s.win_rate * 100,
      matches: s.total_matches,
    }));

  if (data.length === 0) {
    return null;
  }

  const getBarColor = (value: number) => {
    if (value >= 10) return "#10b981";
    if (value >= 5) return "#3b82f6";
    if (value >= 0) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className={`card ${styles.container}`}>
      <h3 className={`text-lg font-semibold text-gradient mb-4 ${styles.title}`}>
        策略性能排行 (Top 10)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" style={{ color: "#94a3b8" }} />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            stroke="#94a3b8"
            style={{ color: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
            formatter={(
              value: number | undefined,
              name: string | undefined,
            ): [string, string] => {
              const numValue = value ?? 0;
              if (name === "avgReturn")
                return [`${numValue.toFixed(2)}%`, "平均收益"];
              if (name === "winRate")
                return [`${numValue.toFixed(1)}%`, "胜率"];
              return [String(numValue), name ?? ""];
            }}
          />
          <Bar dataKey="avgReturn" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.avgReturn)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
