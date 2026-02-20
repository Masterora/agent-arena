import React, { useState } from "react";
import { X, Play } from "lucide-react";
import { Button } from "../common/Button";
import { StrategyList } from "../strategy/StrategyList";
import { useStrategies } from "../../hooks/useStrategies";
import type { RunMatchRequest, MarketType } from "../../types/match";

interface RunMatchFormProps {
  onSubmit: (data: RunMatchRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RunMatchForm: React.FC<RunMatchFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { data: strategies = [] } = useStrategies();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [config, setConfig] = useState({
    market_type: "random" as MarketType,
    duration_steps: 100,
    initial_capital: 10000,
  });

  const handleSelectStrategy = (strategyId: string) => {
    setSelectedIds((prev) =>
      prev.includes(strategyId)
        ? prev.filter((id) => id !== strategyId)
        : [...prev, strategyId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length < 2) {
      alert("请至少选择 2 个策略");
      return;
    }
    onSubmit({
      strategy_ids: selectedIds,
      ...config,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full my-8">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">运行新比赛</h2>
            <p className="text-sm text-gray-600 mt-1">选择策略并配置比赛参数</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 比赛配置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">比赛配置</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  市场类型
                </label>
                <select
                  value={config.market_type}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      market_type: e.target.value as MarketType,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="random">随机波动</option>
                  <option value="trending">上涨趋势</option>
                  <option value="ranging">震荡行情</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">选择模拟的市场环境</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  比赛时长（步数）
                </label>
                <input
                  type="number"
                  value={config.duration_steps}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      duration_steps: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="10"
                  max="500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  10-500 步，每步代表一个时间周期
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  初始资金
                </label>
                <input
                  type="number"
                  value={config.initial_capital}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      initial_capital: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1000"
                  max="1000000"
                  step="1000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">每个策略的起始资金</p>
              </div>
            </div>
          </div>

          {/* 策略选择 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                选择策略 ({selectedIds.length}/10)
              </h3>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  清空选择
                </button>
              )}
            </div>

            {strategies.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">暂无可用策略</p>
                <p className="text-sm text-gray-500 mt-1">
                  请先创建至少 2 个策略
                </p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <StrategyList
                  strategies={strategies}
                  onSelect={(strategy) => handleSelectStrategy(strategy.id)}
                  selectedIds={selectedIds}
                />
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              className="flex-1"
              isLoading={isLoading}
              disabled={selectedIds.length < 2}
            >
              <Play className="h-5 w-5 mr-2" />
              开始比赛
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              取消
            </Button>
          </div>

          {selectedIds.length < 2 && selectedIds.length > 0 && (
            <p className="text-sm text-yellow-600 text-center">
              ⚠️ 至少需要选择 2 个策略才能开始比赛
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
