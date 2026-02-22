import React from "react";
import type { Match } from "../../types/match";
import { Clock, TrendingUp, Users, Calendar, Edit } from "lucide-react";
import { Link } from "react-router-dom";

interface MatchCardProps {
  match: Match;
  onEdit?: (match: Match) => void;
}

const statusLabels: Record<string, string> = {
  pending: "等待中",
  running: "进行中",
  completed: "已完成",
  failed: "失败",
};

const statusColors: Record<string, string> = {
  pending: "status-pending",
  running: "status-running",
  completed: "status-completed",
  failed: "status-failed",
};

export const MatchCard: React.FC<MatchCardProps> = ({ match, onEdit }) => {
  const topParticipant = (match.participants ?? [])
    .filter((p) => p.rank === 1)
    .sort((a, b) => (b.return_pct || 0) - (a.return_pct || 0))[0];

  return (
    <div className="relative h-full group">
      <Link to={`/matches/${match.id}`} className="block h-full">
        <div className="card card-gradient h-full flex flex-col transform group-hover:-translate-y-2 shadow-glow group-hover:shadow-glow-lg">
          {/* 头部 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-8">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-lg font-semibold text-slate-100">
                  {match.config?.trading_pair || "未知"} 比赛
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium badge ${
                    statusColors[match.status]
                  }`}
                >
                  {statusLabels[match.status]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
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
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <span className="text-slate-500">初始资金</span>
              <p className="font-medium text-slate-100">
                ${(match.config?.initial_capital || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-500">市场类型</span>
              <p className="font-medium capitalize text-slate-100">
                {match.config?.market_type || "random"}
              </p>
            </div>
          </div>

          {/* 参赛策略 */}
          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="h-4 w-4" />
                <span>{(match.participants ?? []).length} 个策略参赛</span>
              </div>
              {match.status === "completed" && topParticipant && (
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="font-medium text-emerald-400">
                    冠军: {topParticipant.strategy_name}
                  </span>
                </div>
              )}
            </div>

            {/* 排名预览 */}
            {match.status === "completed" &&
              (match.participants ?? []).length > 0 && (
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
                          <span className="text-slate-500">
                            #{participant.rank}
                          </span>
                          <span className="font-medium text-slate-100">
                            {participant.strategy_name}
                          </span>
                        </div>
                        <span
                          className={`font-medium ${
                            (participant.return_pct || 0) >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
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
      {onEdit && (
        <button
          className="absolute top-3 right-3 z-10 p-2 text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700/50 opacity-0 group-hover:opacity-100"
          onClick={() => onEdit(match)}
          title="复制并编辑此比赛配置"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
