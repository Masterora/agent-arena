import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Match } from "../../types/match";
import type { Strategy } from "../../types/strategy";
import styles from "./DashboardCharts.module.css";

const TYPE_LABELS: Record<string, string> = {
  mean_reversion: "均值回归",
  momentum: "动量追踪",
  dca: "定投策略",
  custom: "自定义",
};

const TYPE_COLORS: Record<string, string> = {
  "均值回归": "#22d3ee",
  "动量追踪": "#10b981",
  "定投策略": "#f59e0b",
  "自定义":   "#a78bfa",
};

const TOOLTIP_STYLE = {
  background: "#0d1426",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  color: "#94a3b8",
  fontSize: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
  padding: "10px 14px",
};

interface DashboardChartsProps {
  matches: Match[];
  strategies: Strategy[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  matches,
  strategies,
}) => {
  const recentActivity = useMemo(() => {
    const days: { day: string; matches: number; strategies: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      days.push({
        day: dateStr,
        matches: matches.filter((m) => {
          const t = new Date(m.created_at).getTime();
          return t >= dayStart && t < dayEnd;
        }).length,
        strategies: strategies.filter((s) => {
          const t = new Date(s.created_at).getTime();
          return t >= dayStart && t < dayEnd;
        }).length,
      });
    }
    return days;
  }, [matches, strategies]);

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    strategies.forEach((s) => {
      const label = TYPE_LABELS[s.type] ?? s.type;
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [strategies]);

  return (
    <div className={styles.grid}>
      {/* 最近活动趋势 */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>最近活动趋势</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={recentActivity} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="1 4" stroke="rgba(148,163,184,0.07)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#475569", marginBottom: "4px", fontSize: "11px" }}
              wrapperStyle={{ outline: "none" }}
              cursor={{ stroke: "rgba(34,211,238,0.12)", strokeWidth: 1 }}
            />
            <Legend wrapperStyle={{ color: "#64748b", fontSize: "12px", paddingTop: "8px" }} iconType="plainline" iconSize={14} />
            <Line type="monotone" dataKey="matches"    stroke="#22d3ee" strokeWidth={2} name="比赛" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            <Line type="monotone" dataKey="strategies" stroke="#10b981" strokeWidth={2} name="策略" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 策略类型分布 */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>策略类型分布</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={typeDistribution} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="1 4" stroke="rgba(148,163,184,0.07)" vertical={false} />
            <XAxis dataKey="type" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#475569", marginBottom: "4px", fontSize: "11px" }}
              wrapperStyle={{ outline: "none" }}
              cursor={{ fill: "rgba(34,211,238,0.04)" }}
              formatter={(value: number | undefined) => [value ?? 0, "策略数量"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {typeDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={TYPE_COLORS[entry.type] ?? "#22d3ee"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
