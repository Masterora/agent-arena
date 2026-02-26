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
import type { MatchParticipant, MatchLogEntry } from "../../types/match";
import styles from "./Chart.module.css";

interface PortfolioValueChartProps {
  participants: MatchParticipant[];
  initialCapital: number;
  steps: number;
  logs?: MatchLogEntry[];
}

/** 从执行日志构建资金变化曲线（真实数据） */
const buildFromLogs = (
  participants: MatchParticipant[],
  initialCapital: number,
  logs: MatchLogEntry[],
): Record<string, number | string>[] => {
  const valueMap: Record<number, Record<string, number>> = {};
  logs.forEach((logEntry) => {
    logEntry.data.logs.forEach((e) => {
      if (!valueMap[e.step]) valueMap[e.step] = {};
      const name = participants.find((p) => p.strategy_id === e.strategy_id)?.strategy_name || e.strategy_id;
      valueMap[e.step][name] = e.portfolio.total_value;
    });
  });

  const names = participants.map((p) => p.strategy_name || p.strategy_id);
  const result: Record<string, number | string>[] = [
    { step: 0, ...Object.fromEntries(names.map((n) => [n, initialCapital])) },
  ];
  Object.keys(valueMap)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((step) => {
      result.push({ step, ...valueMap[step] });
    });
  return result;
};

/** 无日志时仅显示起始和结束两个点 */
const buildFallback = (
  participants: MatchParticipant[],
  initialCapital: number,
  steps: number,
): Record<string, number | string>[] => {
  const start: Record<string, number | string> = { step: 0 };
  const end: Record<string, number | string> = { step: steps };
  participants.forEach((p) => {
    const name = p.strategy_name || p.strategy_id;
    start[name] = initialCapital;
    end[name] = p.final_value ?? initialCapital;
  });
  return [start, end];
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
  logs,
}) => {
  const data =
    logs && logs.length > 0
      ? buildFromLogs(participants, initialCapital, logs)
      : buildFallback(participants, initialCapital, steps);

  return (
    <div className={`card ${styles.container}`}>
      <h3 className={`text-lg font-semibold text-gradient mb-4 ${styles.title}`}>资金变化趋势</h3>
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
