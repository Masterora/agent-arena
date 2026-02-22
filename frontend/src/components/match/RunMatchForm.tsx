import React, { useState, useEffect } from "react";
import { X, Play } from "lucide-react";
import { Button } from "../common/Button";
import { StrategyList } from "../strategy/StrategyList";
import { useStrategies } from "../../hooks/useStrategies";
import { marketApi } from "../../api/market";
import type {
  RunMatchRequest,
  MarketType,
  MarketSource,
  CoinInfo,
} from "../../types/match";

interface RunMatchFormProps {
  onSubmit: (data: RunMatchRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<RunMatchRequest>;
  title?: string;
}

export const RunMatchForm: React.FC<RunMatchFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  title = "运行新比赛",
}) => {
  const { data: strategies = [] } = useStrategies();
  const [coins, setCoins] = useState<CoinInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    defaultValues?.strategy_ids ?? [],
  );
  const [config, setConfig] = useState({
    market_type: (defaultValues?.market_type ?? "random") as MarketType,
    market_source: (defaultValues?.market_source ??
      "simulated") as MarketSource,
    coin_id: defaultValues?.coin_id ?? "ethereum",
    duration_steps: defaultValues?.duration_steps ?? 100,
    initial_capital: defaultValues?.initial_capital ?? 10000,
  });

  useEffect(() => {
    marketApi
      .getSupportedCoins()
      .then(setCoins)
      .catch(() => setCoins([]));
  }, []);

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="form-container max-w-6xl w-full my-8">
        {/* 头部 */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-700/50 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gradient">{title}</h2>
            <p className="text-sm text-slate-400 mt-1">
              选择策略并配置比赛参数
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 比赛配置 */}
          <div className="form-section space-y-4">
            <h3 className="text-lg font-semibold text-gradient">比赛配置</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 数据来源 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  行情数据来源
                </label>
                <select
                  value={config.market_source}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      market_source: e.target.value as MarketSource,
                    })
                  }
                  className="input"
                >
                  <option value="simulated">模拟数据</option>
                  <option value="coingecko_historical">
                    CoinGecko 历史数据
                  </option>
                  <option value="coingecko_realtime">CoinGecko 实时数据</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {config.market_source === "simulated"
                    ? "使用算法生成的模拟行情"
                    : config.market_source === "coingecko_realtime"
                      ? "基于最近 24h 真实 OHLC"
                      : "使用过去 30 天真实 OHLC"}
                </p>
              </div>

              {/* 模拟市场类型（仅在模拟模式下显示） */}
              {config.market_source === "simulated" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
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
                    className="input"
                  >
                    <option value="random">随机波动</option>
                    <option value="trending">上涨趋势</option>
                    <option value="ranging">震荡行情</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    选择模拟的市场环境
                  </p>
                </div>
              ) : (
                /* 真实行情：币种选择 */
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    交易币种
                  </label>
                  <select
                    value={config.coin_id}
                    onChange={(e) =>
                      setConfig({ ...config, coin_id: e.target.value })
                    }
                    className="input"
                  >
                    {coins.length > 0 ? (
                      coins.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.symbol} — {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="bitcoin">BTC — Bitcoin</option>
                        <option value="ethereum">ETH — Ethereum</option>
                        <option value="solana">SOL — Solana</option>
                        <option value="binancecoin">BNB — BNB</option>
                      </>
                    )}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    数据来源：CoinGecko 免费 API
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
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
                  className="input"
                  min="10"
                  max="500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  10-500 步，每步代表一个时间周期
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
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
                  className="input"
                  min="1000"
                  max="1000000"
                  step="1000"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  每个策略的起始资金
                </p>
              </div>
            </div>
          </div>

          {/* 策略选择 */}
          <div className="form-section space-y-4">
            <div className="flex items-center justify-between flex-wrap">
              <h3 className="text-lg font-semibold text-gradient">
                选择策略 ({selectedIds.length}/10)
              </h3>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  清空选择
                </button>
              )}
            </div>

            {strategies.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <p className="text-slate-300">暂无可用策略</p>
                <p className="text-sm text-slate-500 mt-1">
                  请先创建至少 2 个策略
                </p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto rounded-lg border border-slate-700/30 p-3 bg-slate-800/20">
                <StrategyList
                  strategies={strategies}
                  onSelect={(strategy) => handleSelectStrategy(strategy.id)}
                  selectedIds={selectedIds}
                />
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 btn-primary"
              isLoading={isLoading}
              disabled={selectedIds.length < 2}
            >
              <Play className="h-5 w-5 mr-2" />
              开始比赛
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

          {selectedIds.length < 2 && selectedIds.length > 0 && (
            <p className="text-sm text-amber-400 text-center">
              ⚠️ 至少需要选择 2 个策略才能开始比赛
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
