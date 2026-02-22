import React from "react";
import type { Strategy } from "../../types/strategy";
import { TrendingUp, TrendingDown, Target, Trash2, Edit } from "lucide-react";
import { Button } from "../common/Button";

interface StrategyCardProps {
  strategy: Strategy;
  onDelete?: (id: string) => void;
  onEdit?: (strategy: Strategy) => void;
  onSelect?: (strategy: Strategy) => void;
  isSelected?: boolean;
}

const strategyTypeLabels: Record<string, string> = {
  mean_reversion: "均值回归",
  momentum: "动量追踪",
  dca: "定投策略",
  custom: "自定义",
};

const strategyTypeColors: Record<string, string> = {
  mean_reversion: "badge-primary",
  momentum: "badge-success",
  dca: "badge-warning",
  custom: "badge-gray",
};

export const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  onDelete,
  onEdit,
  onSelect,
  isSelected = false,
}) => {
  return (
    <div
      className={`card-sm border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-indigo-500 shadow-lg shadow-indigo-500/40 bg-slate-900/70"
          : "border-slate-700/50 hover:border-indigo-500/30"
      } flex flex-col h-full`}
      onClick={() => onSelect?.(strategy)}
    >
      <div className="space-y-4 flex-1 flex flex-col">
        {/* 头部 */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-semibold text-slate-100 truncate">
                {strategy.name}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium badge ${
                  strategyTypeColors[strategy.type]
                }`}
              >
                {strategyTypeLabels[strategy.type]}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              创建于 {new Date(strategy.created_at).toLocaleDateString("zh-CN")}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 flex-shrink-0 ml-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(strategy);
                }}
                className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                title="编辑"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(strategy.id);
                }}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                title="删除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 参数 */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500">回看周期</span>
            <p className="font-medium text-slate-100">
              {strategy.params.lookback_period}
            </p>
          </div>
          <div>
            <span className="text-slate-500">仓位大小</span>
            <p className="font-medium text-slate-100">
              {(strategy.params.position_size * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <span className="text-slate-500">买入阈值</span>
            <p className="font-medium text-slate-100">
              {strategy.params.buy_threshold}
            </p>
          </div>
          <div>
            <span className="text-slate-500">卖出阈值</span>
            <p className="font-medium text-slate-100">
              {strategy.params.sell_threshold}
            </p>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="pt-4 border-t border-slate-700/50 mt-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                <Target className="h-3 w-3" />
                <span>比赛</span>
              </div>
              <p className="text-lg font-bold text-indigo-400">
                {strategy.total_matches}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                <TrendingUp className="h-3 w-3" />
                <span>胜率</span>
              </div>
              <p className="text-lg font-bold text-emerald-400">
                {(strategy.win_rate * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                <TrendingDown className="h-3 w-3" />
                <span>平均收益</span>
              </div>
              <p
                className={`text-lg font-bold ${
                  strategy.avg_return >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {strategy.avg_return >= 0 ? "+" : ""}
                {strategy.avg_return.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* 选择按钮 */}
        {onSelect && (
          <Button
            className={`w-full mt-4 ${isSelected ? "btn-primary" : "btn-secondary"}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(strategy);
            }}
          >
            {isSelected ? "✓ 已选择" : "选择此策略"}
          </Button>
        )}
      </div>
    </div>
  );
};
