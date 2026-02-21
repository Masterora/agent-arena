import React from 'react';
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
} from 'recharts';

interface DashboardChartsProps {
  strategiesCount: number;
  matchesCount: number;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  strategiesCount,
  matchesCount,
}) => {
  // 模拟最近 7 天的数据
  const recentActivity = Array.from({ length: 7 }, (_, i) => ({
    day: `${i + 1}天前`,
    matches: Math.floor(Math.random() * 10) + 1,
    strategies: Math.floor(Math.random() * 5) + 1,
  })).reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 最近活动 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          最近活动趋势
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={recentActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="matches"
              stroke="#3b82f6"
              strokeWidth={2}
              name="比赛"
            />
            <Line
              type="monotone"
              dataKey="strategies"
              stroke="#10b981"
              strokeWidth={2}
              name="策略"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 策略类型分布 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          策略类型分布
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { type: '均值回归', count: Math.floor(strategiesCount * 0.4) },
              { type: '动量追踪', count: Math.floor(strategiesCount * 0.3) },
              { type: '定投策略', count: Math.floor(strategiesCount * 0.2) },
              { type: '自定义', count: Math.floor(strategiesCount * 0.1) },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="type" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
