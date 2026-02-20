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
  mean_reversion: "bg-blue-100 text-blue-800",
  momentum: "bg-green-100 text-green-800",
  dca: "bg-purple-100 text-purple-800",
  custom: "bg-gray-100 text-gray-800",
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
      className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
        isSelected ? "border-primary-500 shadow-md" : "border-gray-200"
      }`}
    >
      <div className="p-6 space-y-4">
        {/* 头部 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {strategy.name}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  strategyTypeColors[strategy.type]
                }`}
              >
                {strategyTypeLabels[strategy.type]}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              创建于 {new Date(strategy.created_at).toLocaleDateString("zh-CN")}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(strategy)}
                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                title="编辑"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(strategy.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
            <span className="text-gray-500">回看周期</span>
            <p className="font-medium">{strategy.params.lookback_period}</p>
          </div>
          <div>
            <span className="text-gray-500">仓位大小</span>
            <p className="font-medium">
              {(strategy.params.position_size * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <span className="text-gray-500">买入阈值</span>
            <p className="font-medium">{strategy.params.buy_threshold}</p>
          </div>
          <div>
            <span className="text-gray-500">卖出阈值</span>
            <p className="font-medium">{strategy.params.sell_threshold}</p>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                <Target className="h-3 w-3" />
                <span>比赛</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {strategy.total_matches}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                <TrendingUp className="h-3 w-3" />
                <span>胜率</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {(strategy.win_rate * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                <TrendingDown className="h-3 w-3" />
                <span>平均收益</span>
              </div>
              <p
                className={`text-lg font-bold ${
                  strategy.avg_return >= 0 ? "text-green-600" : "text-red-600"
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
            variant={isSelected ? "primary" : "secondary"}
            className="w-full"
            onClick={() => onSelect(strategy)}
          >
            {isSelected ? "已选择" : "选择此策略"}
          </Button>
        )}
      </div>
    </div>
  );
};
