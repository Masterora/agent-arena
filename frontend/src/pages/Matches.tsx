import React, { useState } from "react";
import { Play, Filter } from "lucide-react";
import { Button } from "../components/common/Button";
import { MatchCard } from "../components/match/MatchCard";
import { RunMatchForm } from "../components/match/RunMatchForm";
import { Loading } from "../components/common/Loading";
import { Toast } from "../components/common/Toast";
import { useToast } from "../hooks/useToast";
import { useMatches, useRunMatch } from "../hooks/useMatches";
import type { MatchStatus, RunMatchRequest } from "../types/match";

const Matches: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<MatchStatus | "all">("all");

  const { toasts, removeToast, success, error } = useToast();

  // 数据获取
  const { data: matches = [], isLoading } = useMatches();
  const runMatchMutation = useRunMatch();

  // 过滤比赛
  const filteredMatches =
    filterStatus === "all"
      ? matches
      : matches.filter((m) => m.status === filterStatus);

  // 处理运行比赛
  const handleRunMatch = async (data: RunMatchRequest) => {
    try {
      await runMatchMutation.mutateAsync(data);
      success("比赛运行成功！");
      setIsFormOpen(false);
    } catch (err) {
      error("比赛运行失败，请重试");
      console.error("运行比赛失败:", err);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">比赛列表</h1>
          <p className="text-gray-600 mt-2">
            查看和管理策略对战，共 {matches.length} 场比赛
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          <Play className="h-5 w-5 mr-2" />
          运行新比赛
        </Button>
      </div>

      {/* 过滤器 */}
      <div className="flex items-center gap-3">
        <Filter className="h-5 w-5 text-gray-400" />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部 ({matches.length})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "completed"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            已完成 ({matches.filter((m) => m.status === "completed").length})
          </button>
          <button
            onClick={() => setFilterStatus("running")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "running"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            进行中 ({matches.filter((m) => m.status === "running").length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "pending"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            等待中 ({matches.filter((m) => m.status === "pending").length})
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">总比赛数</div>
          <div className="text-2xl font-bold text-gray-900">
            {matches.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">已完成</div>
          <div className="text-2xl font-bold text-green-600">
            {matches.filter((m) => m.status === "completed").length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">进行中</div>
          <div className="text-2xl font-bold text-blue-600">
            {matches.filter((m) => m.status === "running").length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">平均参赛策略</div>
          <div className="text-2xl font-bold text-primary-600">
            {matches.length > 0
              ? (
                  matches.reduce((sum, m) => sum + (m.participants?.length ?? 0), 0) /
                  matches.length
                ).toFixed(1)
              : 0}
          </div>
        </div>
      </div>

      {/* 比赛列表 */}
      {isLoading ? (
        <Loading />
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无比赛</h3>
          <p className="text-gray-500 mb-4">
            {filterStatus === "all"
              ? "点击上方按钮运行你的第一场比赛"
              : `暂无${filterStatus === "completed" ? "已完成" : filterStatus === "running" ? "进行中" : "等待中"}的比赛`}
          </p>
          {filterStatus === "all" && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Play className="h-5 w-5 mr-2" />
              运行新比赛
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      {/* 运行比赛表单 */}
      {isFormOpen && (
        <RunMatchForm
          onSubmit={handleRunMatch}
          onCancel={() => setIsFormOpen(false)}
          isLoading={runMatchMutation.isPending}
        />
      )}
    </div>
  );
};

export default Matches;
