import React, { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "../components/common/Button";
import { StrategyList } from "../components/strategy/StrategyList";
import { StrategyForm } from "../components/strategy/StrategyForm";
import { StrategyStatsChart } from '../components/strategy/StrategyStatsChart';
import { Toast } from "../components/common/Toast";
import { useToast } from "../hooks/useToast";
import {
  useStrategies,
  useCreateStrategy,
  useDeleteStrategy,
} from "../hooks/useStrategies";
import type { Strategy, StrategyCreate, StrategyType } from "../types/strategy";

const Strategies: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<
    Strategy | undefined
  >();
  const [filterType, setFilterType] = useState<StrategyType | "all">("all");

  const { toasts, removeToast, success, error } = useToast();

  // 数据获取
  const { data: strategies = [], isLoading } = useStrategies();
  const createMutation = useCreateStrategy();
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
        // TODO: 实现编辑功能
        console.log("编辑策略", data);
        success("策略更新成功！");
      } else {
        await createMutation.mutateAsync(data);
        success("策略创建成功！");
      }
      setIsFormOpen(false);
      setEditingStrategy(undefined);
    } catch (err) {
      error("操作失败，请重试");
      console.error("操作失败:", err);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    if (window.confirm("确定要删除这个策略吗？")) {
      try {
        await deleteMutation.mutateAsync(id);
        success("策略删除成功！");
      } catch (err) {
        error("删除失败，请重试");
        console.error("删除失败:", err);
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
    <div className="space-y-6">
      {/* Toast 通知 */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">策略管理</h1>
          <p className="text-gray-600 mt-2">
            创建和管理你的交易策略，共 {strategies.length} 个策略
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          创建策略
        </Button>
      </div>

      {/* 过滤器 */}
      <div className="flex items-center gap-3">
        <Filter className="h-5 w-5 text-gray-400" />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部 ({strategies.length})
          </button>
          <button
            onClick={() => setFilterType("mean_reversion")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "mean_reversion"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            均值回归 (
            {strategies.filter((s) => s.type === "mean_reversion").length})
          </button>
          <button
            onClick={() => setFilterType("momentum")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "momentum"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            动量追踪 ({strategies.filter((s) => s.type === "momentum").length})
          </button>
          <button
            onClick={() => setFilterType("dca")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "dca"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            定投策略 ({strategies.filter((s) => s.type === "dca").length})
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">总策略数</div>
          <div className="text-2xl font-bold text-gray-900">
            {strategies.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">平均胜率</div>
          <div className="text-2xl font-bold text-green-600">
            {strategies.length > 0
              ? (
                  (strategies.reduce((sum, s) => sum + s.win_rate, 0) /
                    strategies.length) *
                  100
                ).toFixed(1)
              : 0}
            %
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">总比赛数</div>
          <div className="text-2xl font-bold text-primary-600">
            {strategies.reduce((sum, s) => sum + s.total_matches, 0)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">平均收益</div>
          <div
            className={`text-2xl font-bold ${
              strategies.length > 0 &&
              strategies.reduce((sum, s) => sum + s.avg_return, 0) /
                strategies.length >=
                0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {strategies.length > 0
              ? (
                  strategies.reduce((sum, s) => sum + s.avg_return, 0) /
                  strategies.length
                ).toFixed(2)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* 策略性能图表 */}
      {strategies.length > 0 && strategies.some(s => s.total_matches > 0) && (
        <StrategyStatsChart strategies={strategies} />
      )}

      {/* 策略列表 */}
      <StrategyList
        strategies={filteredStrategies}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* 创建/编辑表单 */}
      {isFormOpen && (
        <StrategyForm
          strategy={editingStrategy}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
};

export default Strategies;
