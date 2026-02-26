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
import type { MatchParticipant } from "../../types/match";
import styles from "./Chart.module.css";

interface ComparisonChartProps {
  participants: MatchParticipant[];
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  participants,
}) => {
  const data = participants
    .sort((a, b) => (b.return_pct || 0) - (a.return_pct || 0))
    .map((p) => ({
      name: p.strategy_name || "未知策略",
      return: p.return_pct || 0,
      trades: p.total_trades,
      winRate: p.total_trades > 0 ? (p.win_trades / p.total_trades) * 100 : 0,
    }));

  const getBarColor = (value: number) => {
    if (value >= 10) return "#10b981"; // green
    if (value >= 5) return "#3b82f6"; // blue
    if (value >= 0) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div className={`card ${styles.container}`}>
      <h3 className={`text-lg font-semibold text-gradient mb-4 ${styles.title}`}>策略收益对比</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" style={{ color: "#94a3b8" }} />
          <YAxis
            label={{
              value: "收益率 (%)",
              angle: -90,
              position: "insideLeft",
              style: { color: "#94a3b8" },
            }}
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
            formatter={(value: number | undefined) =>
              `${(value ?? 0).toFixed(2)}%`
            }
          />
          <Bar dataKey="return" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.return)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
