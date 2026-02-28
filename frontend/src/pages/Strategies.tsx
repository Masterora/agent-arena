import React, { useState, useRef, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/common/Button";
import { StrategyList } from "../components/strategy/StrategyList";
import { StrategyForm } from "../components/strategy/StrategyForm";
import { StrategyStatsChart } from "../components/strategy/StrategyStatsChart";
import { useToastContext } from "../contexts/ToastContext";
import {
  useStrategies,
  useCreateStrategy,
  useDeleteStrategy,
  useUpdateStrategy,
} from "../hooks/useStrategies";
import type { Strategy, StrategyCreate, StrategyType } from "../types/strategy";

const Strategies: React.FC = () => {
  const [searchParams] = useSearchParams();
  const strategyListRef = useRef<HTMLDivElement>(null);

  // 初始化表单打开状态，如果URL参数中有create=true则打开
  const [isFormOpen, setIsFormOpen] = useState(
    searchParams.get("create") === "true",
  );

  // 当表单打开时滚动到策略列表
  useEffect(() => {
    if (isFormOpen && strategyListRef.current) {
      setTimeout(() => {
        strategyListRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [isFormOpen]);

  const [editingStrategy, setEditingStrategy] = useState<
    Strategy | undefined
  >();
  const [filterType, setFilterType] = useState<StrategyType | "all">("all");

  const { success, error } = useToastContext();

  // 数据获取
  const { data: strategies = [], isLoading } = useStrategies();
  const createMutation = useCreateStrategy();
  const updateMutation = useUpdateStrategy();
  const deleteMutation = useDeleteStrategy();

  // 过滤策略
  const filteredStrategies =
    filterType === "all"
      ? strategies
      : strategies.filter((s) => s.type === filterType);

  // 处理创建/编辑
  const handleSubmit = async (data: StrategyCreate) => {
    try {
      if (editingStrategy) {
        await updateMutation.mutateAsync({ id: editingStrategy.id, data });
        success("策略更新成功！");
      } else {
        await createMutation.mutateAsync(data);
        success("策略创建成功！");
      }
      setIsFormOpen(false);
      setEditingStrategy(undefined);
    } catch {
      // 错误已由 apiClient 拦截器统一 Toast
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    if (window.confirm("确定要删除这个策略吗？")) {
      try {
        await deleteMutation.mutateAsync(id);
        success("策略删除成功！");
      } catch {
        // 错误已由 apiClient 拦截器统一 Toast
      }
    }
  };

  // 处理编辑
  const handleEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setIsFormOpen(true);
  };

  // 关闭表单
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStrategy(undefined);
  };

  return (
    <div className="space-y-5">
      {/* 头部：标题 + 按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">策略管理</h1>
          <p className="text-slate-400 text-sm mt-1">
            共{" "}
            <span className="text-indigo-400 font-semibold">
              {strategies.length}
            </span>{" "}
            个策略
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          创建策略
        </Button>
      </div>

      {/* 过滤 + 统计行 */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-indigo-400 flex-shrink-0" />
        {[
          { key: "all" as const, label: "全部", count: strategies.length },
          {
            key: "mean_reversion" as const,
            label: "均值回归",
            count: strategies.filter((s) => s.type === "mean_reversion").length,
          },
          {
            key: "momentum" as const,
            label: "动量追踪",
            count: strategies.filter((s) => s.type === "momentum").length,
          },
          {
            key: "dca" as const,
            label: "定投策略",
            count: strategies.filter((s) => s.type === "dca").length,
          },
          {
            key: "custom" as const,
            label: "自定义",
            count: strategies.filter((s) => s.type === "custom").length,
          },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              filterType === key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {label} ({count})
          </button>
        ))}
        <div className="flex gap-3 ml-auto">
          <div className="text-center px-3 py-1.5 bg-slate-800/60 rounded-xl">
            <div className="text-xs text-slate-400">平均胜率</div>
            <div className="text-sm font-bold text-emerald-400">
              {strategies.length > 0
                ? (
                    (strategies.reduce((s, x) => s + x.win_rate, 0) /
                      strategies.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>
          <div className="text-center px-3 py-1.5 bg-slate-800/60 rounded-xl">
            <div className="text-xs text-slate-400">总比赛数</div>
            <div className="text-sm font-bold text-indigo-400">
              {strategies.reduce((s, x) => s + x.total_matches, 0)}
            </div>
          </div>
          <div className="text-center px-3 py-1.5 bg-slate-800/60 rounded-xl">
            <div className="text-xs text-slate-400">平均收益</div>
            <div
              className={`text-sm font-bold ${
                strategies.length > 0 &&
                strategies.reduce((s, x) => s + x.avg_return, 0) /
                  strategies.length >=
                  0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {strategies.length > 0
                ? (
                    strategies.reduce((s, x) => s + x.avg_return, 0) /
                    strategies.length
                  ).toFixed(2)
                : 0}
              %
            </div>
          </div>
        </div>
      </div>

      {/* 性能图表 */}
      {strategies.length > 0 && strategies.some((s) => s.total_matches > 0) && (
        <StrategyStatsChart strategies={strategies} />
      )}

      {/* 策略卡片横向网格 */}
      <div ref={strategyListRef}>
        <StrategyList
          strategies={filteredStrategies}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>

      {/* 创建/编辑表单弹窗 */}
      {isFormOpen && (
        <StrategyForm
          strategy={editingStrategy}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={
            editingStrategy
              ? updateMutation.isPending
              : createMutation.isPending
          }
        />
      )}
    </div>
  );
};

export default Strategies;
