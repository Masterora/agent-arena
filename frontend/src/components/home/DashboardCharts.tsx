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

interface DashboardChartsProps {
  strategiesCount: number;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  strategiesCount,
}) => {
  // 生成稳定的模拟数据（基于当前日期的哈希值）
  const recentActivity = useMemo(() => {
    const data = [];
    const seed = new Date().toDateString(); // 每天种子相同
    const seedHash = seed.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

    for (let i = 0; i < 7; i++) {
      // 使用确定性的伪随机数生成
      const pseudo1 = Math.sin(seedHash + i * 7123.456) * 10000;
      const pseudo2 = Math.sin(seedHash + i * 3456.789) * 5000;

      data.push({
        day: `${i + 1}天前`,
        matches: Math.floor(Math.abs(pseudo1) % 10) + 1,
        strategies: Math.floor(Math.abs(pseudo2) % 5) + 1,
      });
    }
    return data.reverse();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 最近活动 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gradient mb-4">
          最近活动趋势
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={recentActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
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
      <div className="card">
        <h3 className="text-lg font-semibold text-gradient mb-4">
          策略类型分布
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { type: "均值回归", count: Math.floor(strategiesCount * 0.4) },
              { type: "动量追踪", count: Math.floor(strategiesCount * 0.3) },
              { type: "定投策略", count: Math.floor(strategiesCount * 0.2) },
              { type: "自定义", count: Math.floor(strategiesCount * 0.1) },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="type" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
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
