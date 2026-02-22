import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MatchParticipant } from "../../types/match";

interface PerformanceChartProps {
  participants: MatchParticipant[];
  steps: number;
}

// 生成模拟的收益曲线数据
const generatePerformanceData = (
  participants: MatchParticipant[],
  steps: number,
) => {
  const data: Record<string, number | string>[] = [];

  for (let step = 0; step <= steps; step++) {
    const point: Record<string, number | string> = { step };

    participants.forEach((participant) => {
      const finalReturn = participant.return_pct || 0;
      // 模拟收益曲线（简单线性 + 随机波动）
      const progress = step / steps;
      const randomFactor = Math.sin(step * 0.1) * 2; // 添加波动
      const value = progress * finalReturn + randomFactor;

      point[participant.strategy_name || participant.strategy_id] = value;
    });

    data.push(point);
  }

  return data;
};

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  participants,
  steps,
}) => {
  const data = generatePerformanceData(participants, steps);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gradient mb-4">收益曲线对比</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="step"
            label={{ value: "时间步数", position: "insideBottom", offset: -5 }}
            stroke="#94a3b8"
            style={{ color: "#94a3b8" }}
          />
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
          <Legend wrapperStyle={{ color: "#94a3b8" }} />
          {participants.map((participant, index) => (
            <Line
              key={participant.strategy_id}
              type="monotone"
              dataKey={participant.strategy_name || participant.strategy_id}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
