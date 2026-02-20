import React from "react";
import type { Strategy } from "../../types/strategy";
import { StrategyCard } from "./StrategyCard";
import { Loading } from "../common/Loading";

interface StrategyListProps {
  strategies: Strategy[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (strategy: Strategy) => void;
  onSelect?: (strategy: Strategy) => void;
  selectedIds?: string[];
}

export const StrategyList: React.FC<StrategyListProps> = ({
  strategies,
  isLoading = false,
  onDelete,
  onEdit,
  onSelect,
  selectedIds = [],
}) => {
  if (isLoading) {
    return <Loading />;
  }

  if (strategies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无策略</h3>
        <p className="text-gray-500">点击上方按钮创建你的第一个策略</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
