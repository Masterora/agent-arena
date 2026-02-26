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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const TradeDistributionChart: React.FC<TradeDistributionChartProps> = ({
  participants,
}) => {
  const data = participants.map((p) => ({
    name: p.strategy_name || "未知策略",
    value: p.total_trades,
  }));

  return (
    <div className={`card ${styles.container}`}>
      <h3 className={`text-lg font-semibold text-gradient mb-4 ${styles.title}`}>交易次数分布</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent = 0 }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
          />
          <Legend wrapperStyle={{ color: "#94a3b8" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
