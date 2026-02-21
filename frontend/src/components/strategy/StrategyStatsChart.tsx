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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        策略性能排行 (Top 10)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis dataKey="name" type="category" width={150} stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: number | undefined, name: string | undefined): [string, string] => {
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
