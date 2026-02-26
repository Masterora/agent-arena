import React from "react";
import type { Match } from "../../types/match";
import { Clock, TrendingUp, Users, Calendar, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./MatchCard.module.css";

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
    <div className={`${styles.wrapper} group`}>
      <Link to={`/matches/${match.id}`} className="block h-full">
        <div className={styles.inner}>
          {/* 头部 */}
          <div className={styles.header}>
            <div className="flex-1 pr-8">
              <div className={styles.titleRow}>
                <h3 className={styles.title}>
                  {match.config?.trading_pair || "未知"} 比赛
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium badge ${statusColors[match.status]}`}>
                  {statusLabels[match.status]}
                </span>
              </div>
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(match.created_at).toLocaleDateString("zh-CN")}</span>
                </div>
                <div className={styles.metaItem}>
                  <Clock className="h-4 w-4" />
                  <span>{match.config?.duration_steps || 0} 步</span>
                </div>
              </div>
            </div>
          </div>

          {/* 配置信息 */}
          <div className={styles.config}>
            <div>
              <span className={styles.configLabel}>初始资金</span>
              <p className={styles.configValue}>
                ${(match.config?.initial_capital || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <span className={styles.configLabel}>市场类型</span>
              <p className={styles.configValue}>
                {match.config?.market_type || "random"}
              </p>
            </div>
          </div>

          {/* 参赛策略 */}
          <div className={styles.footer}>
            <div className={styles.footerRow}>
              <div className={styles.footerMeta}>
                <Users className="h-4 w-4" />
                <span>{(match.participants ?? []).length} 个策略参赛</span>
              </div>
              {match.status === "completed" && topParticipant && (
                <div className={styles.winner}>
                  <TrendingUp className="h-4 w-4" />
                  <span>冠军: {topParticipant.strategy_name}</span>
                </div>
              )}
            </div>

            {/* 排名预览 */}
            {match.status === "completed" && (match.participants ?? []).length > 0 && (
              <div className={styles.rankings}>
                {(match.participants ?? [])
                  .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                  .slice(0, 3)
                  .map((participant) => (
                    <div key={participant.strategy_id} className={styles.rankRow}>
                      <div className={styles.rankLeft}>
                        <span className={styles.rankNum}>#{participant.rank}</span>
                        <span className={styles.rankName}>{participant.strategy_name}</span>
                      </div>
                      <span className={(participant.return_pct || 0) >= 0 ? styles.returnPositive : styles.returnNegative}>
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
          className={styles.editBtn}
          onClick={() => onEdit(match)}
          title="复制并编辑此比赛配置"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
