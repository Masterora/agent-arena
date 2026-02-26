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

/** 优先使用 value_history（完整每步数据） */
const buildFromValueHistory = (
  participants: MatchParticipant[],
  initialCapital: number,
): Record<string, number | string>[] | null => {
  const withHistory = participants.filter((p) => p.value_history && p.value_history.length > 1);
  if (withHistory.length === 0) return null;
  const maxLen = Math.max(...withHistory.map((p) => p.value_history!.length));
  return Array.from({ length: maxLen }, (_, i) => {
    const row: Record<string, number | string> = { step: i };
    participants.forEach((p) => {
      const name = p.strategy_name || p.strategy_id;
      const v = p.value_history?.[i];
      row[name] =
        v !== undefined
          ? parseFloat((((v - initialCapital) / initialCapital) * 100).toFixed(3))
          : 0;
    });
    return row;
  });
};

/** 从执行日志构建收益率曲线（备用） */
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
      valueMap[e.step][name] = ((e.portfolio.total_value - initialCapital) / initialCapital) * 100;
    });
  });
  const names = participants.map((p) => p.strategy_name || p.strategy_id);
  const result: Record<string, number | string>[] = [{ step: 0, ...Object.fromEntries(names.map((n) => [n, 0])) }];
  Object.keys(valueMap).map(Number).sort((a, b) => a - b).forEach((step) => {
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

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  participants, steps, initialCapital, logs,
}) => {
  const data =
    buildFromValueHistory(participants, initialCapital) ??
    (logs && logs.length > 0
      ? buildFromLogs(participants, initialCapital, logs)
      : buildFallback(participants, steps));

  return (
    <div className={styles.container}>
      <p className={styles.title}>收益率对比</p>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="1 4" stroke="rgba(148,163,184,0.07)" vertical={false} />
          <XAxis
            dataKey="step"
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v > 0 ? "+" : ""}${Number(v).toFixed(1)}%`}
            width={52}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "#475569", marginBottom: "4px", fontSize: "11px" }}
            wrapperStyle={{ outline: "none" }}
            cursor={{ stroke: "rgba(34,211,238,0.12)", strokeWidth: 1 }}
            formatter={(value: number | undefined) => [
              `${(value ?? 0) > 0 ? "+" : ""}${(value ?? 0).toFixed(2)}%`,
            ]}
          />
          <Legend
            wrapperStyle={{ color: "#64748b", fontSize: "12px", paddingTop: "12px" }}
            iconType="plainline"
            iconSize={16}
          />
          {participants.map((participant, index) => (
            <Line
              key={participant.strategy_id}
              type="monotone"
              dataKey={participant.strategy_name || participant.strategy_id}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
