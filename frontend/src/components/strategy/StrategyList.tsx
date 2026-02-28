import React from "react";
import type { Strategy } from "../../types/strategy";
import { StrategyCard } from "./StrategyCard";
import { Button } from "../common/Button";
import { Loading } from "../common/Loading";
import { Plus } from "lucide-react";
import styles from "./StrategyList.module.css";

interface StrategyListProps {
  strategies: Strategy[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (strategy: Strategy) => void;
  onSelect?: (strategy: Strategy) => void;
  selectedIds?: string[];
  /** 空状态时点击「创建策略」的回调，不传则只显示文案 */
  onEmptyAction?: () => void;
}

export const StrategyList: React.FC<StrategyListProps> = ({
  strategies,
  isLoading = false,
  onDelete,
  onEdit,
  onSelect,
  selectedIds = [],
  onEmptyAction,
}) => {
  if (isLoading) {
    return <Loading />;
  }

  if (strategies.length === 0) {
    return (
      <div className={`card text-center py-12 ${styles.empty}`}>
        <div className={styles.emptyIcon}>
          <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>暂无策略</h3>
        <p className={styles.emptyHint}>
          {onEmptyAction ? "创建你的第一个策略，开始参与比赛" : "点击上方按钮创建你的第一个策略"}
        </p>
        {onEmptyAction && (
          <Button onClick={onEmptyAction} className="btn-primary mt-4">
            <Plus className="h-4 w-4 mr-2" />
            创建策略
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {strategies.map((strategy) => (
        <StrategyCard
          key={strategy.id}
          strategy={strategy}
          onDelete={onDelete}
          onEdit={onEdit}
          onSelect={onSelect}
          isSelected={selectedIds.includes(strategy.id)}
        />
      ))}
    </div>
  );
};
