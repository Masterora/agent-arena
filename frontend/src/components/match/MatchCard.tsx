import React from "react";
import type { Match } from "../../types/match";
import { Clock, TrendingUp, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface MatchCardProps {
  match: Match;
}

const statusLabels: Record<string, string> = {
  pending: "等待中",
  running: "进行中",
  completed: "已完成",
  failed: "失败",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const topParticipant = (match.participants ?? [])
    .filter((p) => p.rank === 1)
    .sort((a, b) => (b.return_pct || 0) - (a.return_pct || 0))[0];

  return (
    <Link to={`/matches/${match.id}`}>
      <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all p-6 space-y-4">
        {/* 头部 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {match.config?.trading_pair || "未知"} 比赛
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[match.status]
                }`}
              >
                {statusLabels[match.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(match.created_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{match.config?.duration_steps || 0} 步</span>
              </div>
            </div>
          </div>
        </div>

        {/* 配置信息 */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">初始资金</span>
            <p className="font-medium">
              ${(match.config?.initial_capital || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-gray-500">市场类型</span>
            <p className="font-medium capitalize">
              {match.config?.market_type || "random"}
            </p>
          </div>
        </div>

        {/* 参赛策略 */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{(match.participants ?? []).length} 个策略参赛</span>
            </div>
            {match.status === "completed" && topParticipant && (
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">
                  冠军: {topParticipant.strategy_name}
                </span>
              </div>
            )}
          </div>

          {/* 排名预览 */}
          {match.status === "completed" && (match.participants ?? []).length > 0 && (
            <div className="space-y-2">
              {(match.participants ?? [])
                .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                .slice(0, 3)
                .map((participant) => (
                  <div
                    key={participant.strategy_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">#{participant.rank}</span>
                      <span className="font-medium">
                        {participant.strategy_name}
                      </span>
                    </div>
                    <span
                      className={`font-medium ${
                        (participant.return_pct || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(participant.return_pct || 0) >= 0 ? "+" : ""}
                      {(participant.return_pct || 0).toFixed(2)}%
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
