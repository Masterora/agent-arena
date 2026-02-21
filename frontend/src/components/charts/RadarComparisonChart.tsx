import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { MatchParticipant } from "../../types/match";

interface RadarComparisonChartProps {
  participants: MatchParticipant[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const RadarComparisonChart: React.FC<RadarComparisonChartProps> = ({
  participants,
}) => {
  // 准备雷达图数据
  const metrics = [
    { name: "收益率", key: "return" },
    { name: "胜率", key: "winRate" },
    { name: "交易频率", key: "tradeFreq" },
    { name: "稳定性", key: "stability" },
  ];

  // 归一化数据到 0-100
  const normalize = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  const maxReturn = Math.max(
    ...participants.map((p) => Math.abs(p.return_pct || 0)),
  );
  const maxTrades = Math.max(...participants.map((p) => p.total_trades));

  const data = metrics.map((metric) => {
    const point: Record<string, string | number> = { metric: metric.name };

    participants.forEach((p) => {
      const strategyName = p.strategy_name || "未知策略";
      let value = 0;

      switch (metric.key) {
        case "return":
          value = normalize(Math.abs(p.return_pct || 0), maxReturn);
          break;
        case "winRate":
          value =
            p.total_trades > 0 ? (p.win_trades / p.total_trades) * 100 : 0;
          break;
        case "tradeFreq":
          value = normalize(p.total_trades, maxTrades);
          break;
        case "stability":
          // 模拟稳定性分数（实际应该从历史数据计算）
          value = p.total_trades > 0 ? 70 + Math.random() * 30 : 0;
          break;
      }

      point[strategyName] = value;
    });

    return point;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        策略性能雷达图
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: number | undefined) => (value ?? 0).toFixed(1)}
          />
          <Legend />
          {participants.slice(0, 5).map((p, index) => (
            <Radar
              key={p.strategy_id}
              name={p.strategy_name || "未知策略"}
              dataKey={p.strategy_name || "未知策略"}
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.3}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
