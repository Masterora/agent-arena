import React, { useState } from "react";
import type {
  Strategy,
  StrategyCreate,
  StrategyType,
} from "../../types/strategy";
import { Button } from "../common/Button";
import { X } from "lucide-react";

interface StrategyFormProps {
  strategy?: Strategy;
  onSubmit: (data: StrategyCreate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const StrategyForm: React.FC<StrategyFormProps> = ({
  strategy,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<StrategyCreate>({
    name: strategy?.name || "",
    type: strategy?.type || "mean_reversion",
    params: strategy?.params || {
      lookback_period: 20,
      buy_threshold: 0.97,
      sell_threshold: 1.03,
      position_size: 0.2,
      max_position_pct: 0.5,
    },
    code: strategy?.code || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.params.buy_threshold >= formData.params.sell_threshold) {
      alert("买入阈值必须小于卖出阈值");
      return;
    }
    if (
      formData.params.position_size > (formData.params.max_position_pct ?? 0.5)
    ) {
      alert("每次仓位大小不能超过最大仓位限制");
      return;
    }
    onSubmit(formData);
  };

  const updateParam = (key: string, value: number) => {
    setFormData({
      ...formData,
      params: {
        ...formData.params,
        [key]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="form-container max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-700/50 mb-6">
          <h2 className="text-2xl font-bold text-gradient">
            {strategy ? "编辑策略" : "创建新策略"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="form-section space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                策略名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input"
                placeholder="例如：我的均值回归策略"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                策略类型 *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as StrategyType,
                  })
                }
                className="input"
              >
                <option value="mean_reversion">均值回归</option>
                <option value="momentum">动量追踪</option>
                <option value="dca">定投策略</option>
                <option value="custom">自定义</option>
              </select>
            </div>
          </div>

          {/* 策略参数 */}
          <div className="form-section space-y-4">
            <h3 className="text-lg font-semibold text-gradient">策略参数</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  回看周期
                </label>
                <input
                  type="number"
                  value={formData.params.lookback_period}
                  onChange={(e) =>
                    updateParam("lookback_period", parseInt(e.target.value))
                  }
                  className="input"
                  min="1"
                  max="100"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  用于计算均值的历史数据点数
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  仓位大小 (%)
                </label>
                <input
                  type="number"
                  value={formData.params.position_size * 100}
                  onChange={(e) =>
                    updateParam(
                      "position_size",
                      parseFloat(e.target.value) / 100,
                    )
                  }
                  className="input"
                  min="1"
                  max="100"
                  step="1"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  每次交易使用的资金比例
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  买入阈值
                </label>
                <input
                  type="number"
                  value={formData.params.buy_threshold}
                  onChange={(e) =>
                    updateParam("buy_threshold", parseFloat(e.target.value))
                  }
                  className="input"
                  min="0.5"
                  max="1.5"
                  step="0.01"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  价格低于均值的比例时买入
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  卖出阈值
                </label>
                <input
                  type="number"
                  value={formData.params.sell_threshold}
                  onChange={(e) =>
                    updateParam("sell_threshold", parseFloat(e.target.value))
                  }
                  className="input"
                  min="0.5"
                  max="1.5"
                  step="0.01"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  价格高于均值的比例时卖出
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  最大仓位 (%)
                </label>
                <input
                  type="number"
                  value={(formData.params.max_position_pct || 0.5) * 100}
                  onChange={(e) =>
                    updateParam(
                      "max_position_pct",
                      parseFloat(e.target.value) / 100,
                    )
                  }
                  className="input"
                  min="10"
                  max="100"
                  step="5"
                />
                <p className="text-xs text-slate-500 mt-1">
                  持仓的最大资金比例
                </p>
              </div>
            </div>
          </div>

          {/* 自定义代码（可选） */}
          {formData.type === "custom" && (
            <div className="form-section">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                自定义代码（Python）
              </label>
              <textarea
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="input font-mono text-sm resize-none"
                rows={10}
                placeholder="def execute(self, market_data, portfolio):&#10;    # 你的策略代码&#10;    pass"
              />
              <p className="text-xs text-slate-500 mt-1">
                ⚠️ 自定义代码将在沙盒环境中运行
              </p>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 btn-primary"
              isLoading={isLoading}
            >
              {strategy ? "保存修改" : "创建策略"}
            </Button>
            <Button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
