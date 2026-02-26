import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { MatchParticipant } from "../../types/match";
import styles from "./Chart.module.css";

interface TradeDistributionChartProps {
  participants: MatchParticipant[];
}

const CHART_COLORS = ["#22d3ee", "#10b981", "#f59e0b", "#fb7185", "#a78bfa", "#fb923c"];

const TOOLTIP_STYLE = {
  background: "#0d1426",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  color: "#94a3b8",
  fontSize: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
  padding: "10px 14px",
};

export const TradeDistributionChart: React.FC<TradeDistributionChartProps> = ({
  participants,
}) => {
  const data = participants
    .map((p) => ({ name: p.strategy_name || "未知策略", value: p.total_trades }))
    .filter((d) => d.value > 0);

  return (
    <div className={styles.container}>
      <p className={styles.title}>交易次数分布</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="48%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "#475569", marginBottom: "4px", fontSize: "11px" }}
            wrapperStyle={{ outline: "none" }}
            formatter={(value: number | undefined) => [value ?? 0, "交易次数"]}
          />
          <Legend
            wrapperStyle={{ color: "#64748b", fontSize: "12px" }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
