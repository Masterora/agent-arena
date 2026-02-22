import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MatchParticipant } from "../../types/match";

interface PortfolioValueChartProps {
  participants: MatchParticipant[];
  initialCapital: number;
  steps: number;
}

const generatePortfolioData = (
  participants: MatchParticipant[],
  initialCapital: number,
  steps: number,
) => {
  const data: Record<string, number | string>[] = [];

  for (let step = 0; step <= steps; step++) {
    const point: Record<string, number | string> = { step };

    participants.forEach((participant) => {
      const finalValue = participant.final_value || initialCapital;
      const progress = step / steps;
      const randomFactor = (Math.random() - 0.5) * initialCapital * 0.02;
      const value =
        initialCapital +
        (finalValue - initialCapital) * progress +
        randomFactor;

      point[participant.strategy_name || participant.strategy_id] = value;
    });

    data.push(point);
  }

  return data;
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export const PortfolioValueChart: React.FC<PortfolioValueChartProps> = ({
  participants,
  initialCapital,
  steps,
}) => {
  const data = generatePortfolioData(participants, initialCapital, steps);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gradient mb-4">资金变化趋势</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <defs>
            {participants.map((p, index) => (
              <linearGradient
                key={p.strategy_id}
                id={`color${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={COLORS[index % COLORS.length]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={COLORS[index % COLORS.length]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="step"
            label={{ value: "时间步数", position: "insideBottom", offset: -5 }}
            stroke="#94a3b8"
            style={{ color: "#94a3b8" }}
          />
          <YAxis
            label={{
              value: "资金 ($)",
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
              `$${(value ?? 0).toFixed(2)}`
            }
          />
          {participants.map((p, index) => (
            <Area
              key={p.strategy_id}
              type="monotone"
              dataKey={p.strategy_name || p.strategy_id}
              stroke={COLORS[index % COLORS.length]}
              fillOpacity={1}
              fill={`url(#color${index})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
