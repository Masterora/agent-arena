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
import type { MatchParticipant, MatchLogEntry } from "../../types/match";
import styles from "./Chart.module.css";

interface PerformanceChartProps {
  participants: MatchParticipant[];
  steps: number;
  initialCapital: number;
  logs?: MatchLogEntry[];
}

/** 从执行日志构建收益率曲线（真实数据） */
const buildFromLogs = (
  participants: MatchParticipant[],
  initialCapital: number,
  logs: MatchLogEntry[],
): Record<string, number | string>[] => {
  // 展平所有 log entries，按 step+strategy 建索引
  const valueMap: Record<number, Record<string, number>> = {};
  logs.forEach((logEntry) => {
    logEntry.data.logs.forEach((e) => {
      if (!valueMap[e.step]) valueMap[e.step] = {};
      const name = participants.find((p) => p.strategy_id === e.strategy_id)?.strategy_name || e.strategy_id;
      valueMap[e.step][name] = ((e.portfolio.total_value - initialCapital) / initialCapital) * 100;
    });
  });

  // 加入起始点
  const names = participants.map((p) => p.strategy_name || p.strategy_id);
  const result: Record<string, number | string>[] = [{ step: 0, ...Object.fromEntries(names.map((n) => [n, 0])) }];
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
  steps: number,
): Record<string, number | string>[] => {
  const start: Record<string, number | string> = { step: 0 };
  const end: Record<string, number | string> = { step: steps };
  participants.forEach((p) => {
    const name = p.strategy_name || p.strategy_id;
    start[name] = 0;
    end[name] = p.return_pct ?? 0;
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
  "#06b6d4",
  "#f97316",
];

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  participants,
  steps,
  initialCapital,
  logs,
}) => {
  const data =
    logs && logs.length > 0
      ? buildFromLogs(participants, initialCapital, logs)
      : buildFallback(participants, steps);

  return (
    <div className={`card ${styles.container}`}>
      <h3 className={`text-lg font-semibold text-gradient mb-4 ${styles.title}`}>收益曲线对比</h3>
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
