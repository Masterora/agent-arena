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
  ResponsiveContainer,
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

interface DashboardChartsProps {
  matches: Match[];
  strategies: Strategy[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  matches,
  strategies,
}) => {
  // 最近 7 天每天的比赛数和策略创建数（真实数据）
  const recentActivity = useMemo(() => {
    const days: { day: string; matches: number; strategies: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("zh-CN", {
        month: "numeric",
        day: "numeric",
      });
      const dayStart = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).getTime();
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

  // 策略类型分布（真实数据）
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
      {/* 最近活动 */}
      <div className={`card ${styles.chartCard}`}>
        <h3 className={`text-lg font-semibold text-gradient mb-4 ${styles.chartTitle}`}>
          最近活动趋势
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={recentActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <Line
              type="monotone"
              dataKey="matches"
              stroke="#3b82f6"
              strokeWidth={2}
              name="比赛"
              dot={{ fill: "#3b82f6" }}
            />
            <Line
              type="monotone"
              dataKey="strategies"
              stroke="#10b981"
              strokeWidth={2}
              name="策略"
              dot={{ fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 策略类型分布 */}
      <div className={`card ${styles.chartCard}`}>
        <h3 className={`text-lg font-semibold text-gradient mb-4 ${styles.chartTitle}`}>
          策略类型分布
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={typeDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="type" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
