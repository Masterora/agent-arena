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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">策略收益对比</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis
            label={{ value: "收益率 (%)", angle: -90, position: "insideLeft" }}
            stroke="#6b7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: number | undefined) => `${(value ?? 0).toFixed(2)}%`}
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
