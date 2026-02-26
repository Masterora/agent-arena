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
import styles from "./Chart.module.css";

interface RadarComparisonChartProps {
  participants: MatchParticipant[];
}

const CHART_COLORS = ["#22d3ee", "#10b981", "#f59e0b", "#fb7185", "#a78bfa"];

const TOOLTIP_STYLE = {
  background: "#0d1426",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  color: "#94a3b8",
  fontSize: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
  padding: "10px 14px",
};

export const RadarComparisonChart: React.FC<RadarComparisonChartProps> = ({
  participants,
}) => {
  const metrics = [
    { name: "收益率", key: "return" },
    { name: "胜率",   key: "winRate" },
    { name: "交易频率", key: "tradeFreq" },
    { name: "稳定性", key: "stability" },
  ];

  const maxReturn = Math.max(...participants.map((p) => Math.abs(p.return_pct || 0)), 1);
  const maxTrades = Math.max(...participants.map((p) => p.total_trades), 1);

  const data = metrics.map((metric) => {
    const point: Record<string, string | number> = { metric: metric.name };
    participants.forEach((p) => {
      const strategyName = p.strategy_name || "未知策略";
      let value = 0;
      switch (metric.key) {
        case "return":
          value = Math.min((Math.abs(p.return_pct || 0) / maxReturn) * 100, 100);
          break;
        case "winRate":
          value = p.total_trades > 0 ? (p.win_trades / p.total_trades) * 100 : 0;
          break;
        case "tradeFreq":
          value = Math.min((p.total_trades / maxTrades) * 100, 100);
          break;
        case "stability":
          value = p.total_trades > 0
            ? Math.min(100, (p.win_trades / p.total_trades) * 60 + (Math.min(p.total_trades, 50) / 50) * 40)
            : 0;
          break;
      }
      point[strategyName] = value;
    });
    return point;
  });

  return (
    <div className={styles.container}>
      <p className={styles.title}>策略性能雷达图</p>
      <ResponsiveContainer width="100%" height={360}>
        <RadarChart data={data} margin={{ top: 12, right: 24, left: 24, bottom: 12 }}>
          <PolarGrid stroke="rgba(148,163,184,0.1)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#334155", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "#475569", marginBottom: "4px", fontSize: "11px" }}
            wrapperStyle={{ outline: "none" }}
            formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}`]}
          />
          <Legend
            wrapperStyle={{ color: "#64748b", fontSize: "12px" }}
            iconType="circle"
            iconSize={8}
          />
          {participants.slice(0, 5).map((p, index) => (
            <Radar
              key={p.strategy_id}
              name={p.strategy_name || "未知策略"}
              dataKey={p.strategy_name || "未知策略"}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.12}
              strokeWidth={1.5}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
