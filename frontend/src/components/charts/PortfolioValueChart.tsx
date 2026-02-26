import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  Object.keys(valueMap).map(Number).sort((a, b) => a - b).forEach((step) => {
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

export const PortfolioValueChart: React.FC<PortfolioValueChartProps> = ({
  participants, initialCapital, steps, logs,
}) => {
  const data =
    logs && logs.length > 0
      ? buildFromLogs(participants, initialCapital, logs)
      : buildFallback(participants, initialCapital, steps);

  return (
    <div className={styles.container}>
      <p className={styles.title}>资金变化趋势</p>
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <defs>
            {participants.map((p, index) => (
              <linearGradient key={p.strategy_id} id={`pv-grad${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.18} />
                <stop offset="100%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
            tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(1)}k`}
            width={48}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "#475569", marginBottom: "4px", fontSize: "11px" }}
            wrapperStyle={{ outline: "none" }}
            cursor={{ stroke: "rgba(34,211,238,0.12)", strokeWidth: 1, fill: "rgba(34,211,238,0.02)" }}
            formatter={(value: number | undefined) => [
              `$${(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
            ]}
          />
          <Legend
            wrapperStyle={{ color: "#64748b", fontSize: "12px", paddingTop: "12px" }}
            iconType="plainline"
            iconSize={16}
          />
          {participants.map((p, index) => (
            <Area
              key={p.strategy_id}
              type="monotone"
              dataKey={p.strategy_name || p.strategy_id}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              fill={`url(#pv-grad${index})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
