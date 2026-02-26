import React, { useState } from "react";
import { Play, Filter } from "lucide-react";
import { Button } from "../components/common/Button";
import { MatchCard } from "../components/match/MatchCard";
import { RunMatchForm } from "../components/match/RunMatchForm";
import { Loading } from "../components/common/Loading";
import { Toast } from "../components/common/Toast";
import { useToast } from "../hooks/useToast";
import { useMatches, useRunMatch, useDeleteMatch } from "../hooks/useMatches";
import type { Match, MatchStatus, RunMatchRequest } from "../types/match";

const Matches: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<MatchStatus | "all">("all");
  const [cloneDefaults, setCloneDefaults] = useState<
    Partial<RunMatchRequest> | undefined
  >();
  const [formTitle, setFormTitle] = useState("运行新比赛");

  const { toasts, removeToast, success, error } = useToast();

  // 数据获取
  const { data: matches = [], isLoading } = useMatches();
  const runMatchMutation = useRunMatch();
  const deleteMatchMutation = useDeleteMatch();

  // 过滤比赛
  const filteredMatches =
    filterStatus === "all"
      ? matches
      : matches.filter((m) => m.status === filterStatus);

  // 处理运行比赛
  const handleRunMatch = async (data: RunMatchRequest) => {
    try {
      await runMatchMutation.mutateAsync(data);
      success("比赛已提交，正在后台运行中…");
      setIsFormOpen(false);
      setCloneDefaults(undefined);
    } catch (err) {
      error("比赛提交失败，请重试");
      console.error("运行比赛失败:", err);
    }
  };

  // 处理删除比赛
  const handleDeleteMatch = async (match: Match) => {
    if (!window.confirm(`确定要删除这场比赛吗？`)) return;
    try {
      await deleteMatchMutation.mutateAsync(match.id);
      success("比赛已删除");
    } catch {
      error("删除失败，请重试");
    }
  };

  // 处理复制比赛配置编辑
  const handleEditMatch = (match: Match) => {
    const strategyIds = (match.participants ?? []).map((p) => p.strategy_id);
    setCloneDefaults({
      strategy_ids: strategyIds,
      market_type: match.config?.market_type ?? "random",
      duration_steps: match.config?.duration_steps ?? 100,
      initial_capital: match.config?.initial_capital ?? 10000,
    });
    setFormTitle("复制比赛配置");
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-5">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* 头部：标题 + 按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">比赛列表</h1>
          <p className="text-slate-400 text-sm mt-1">
            共{" "}
            <span className="text-indigo-400 font-semibold">
              {matches.length}
            </span>{" "}
            场比赛
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="btn-primary">
          <Play className="h-4 w-4 mr-2" />
          运行新比赛
        </Button>
      </div>

      {/* 过滤 + 统计行 */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-indigo-400 flex-shrink-0" />
        {[
          { key: "all" as const, label: "全部", count: matches.length },
          {
            key: "completed" as const,
            label: "已完成",
            count: matches.filter((m) => m.status === "completed").length,
          },
          {
            key: "running" as const,
            label: "进行中",
            count: matches.filter((m) => m.status === "running").length,
          },
          {
            key: "pending" as const,
            label: "等待中",
            count: matches.filter((m) => m.status === "pending").length,
          },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              filterStatus === key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {label} ({count})
          </button>
        ))}
        <div className="flex gap-3 ml-auto">
          <div className="text-center px-3 py-1.5 bg-slate-800/60 rounded-xl">
            <div className="text-xs text-slate-400">已完成</div>
            <div className="text-sm font-bold text-emerald-400">
              {matches.filter((m) => m.status === "completed").length}
            </div>
          </div>
          <div className="text-center px-3 py-1.5 bg-slate-800/60 rounded-xl">
            <div className="text-xs text-slate-400">进行中</div>
            <div className="text-sm font-bold text-blue-400">
              {matches.filter((m) => m.status === "running").length}
            </div>
          </div>
          <div className="text-center px-3 py-1.5 bg-slate-800/60 rounded-xl">
            <div className="text-xs text-slate-400">平均参赛</div>
            <div className="text-sm font-bold text-indigo-400">
              {matches.length > 0
                ? (
                    matches.reduce(
                      (sum, m) => sum + (m.participants?.length ?? 0),
                      0,
                    ) / matches.length
                  ).toFixed(1)
                : 0}
            </div>
          </div>
        </div>
      </div>

      {/* 比赛卡片横向网格 */}
      {isLoading ? (
        <Loading />
      ) : filteredMatches.length === 0 ? (
        <div className="card text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
            <Play className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-100 mb-2">暂无比赛</h3>
          <p className="text-slate-400 mb-4">
            {filterStatus === "all"
              ? "点击右上角按钮运行你的第一场比赛"
              : `暂无${filterStatus === "completed" ? "已完成" : filterStatus === "running" ? "进行中" : "等待中"}的比赛`}
          </p>
          {filterStatus === "all" && (
            <Button onClick={() => setIsFormOpen(true)} className="btn-primary">
              <Play className="h-4 w-4 mr-2" />
              运行新比赛
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} onEdit={handleEditMatch} onDelete={handleDeleteMatch} />
          ))}
        </div>
      )}

      {/* 运行比赛表单弹窗 */}
      {isFormOpen && (
        <RunMatchForm
          onSubmit={handleRunMatch}
          onCancel={() => {
            setIsFormOpen(false);
            setCloneDefaults(undefined);
            setFormTitle("运行新比赛");
          }}
          isLoading={runMatchMutation.isPending}
          defaultValues={cloneDefaults}
          title={formTitle}
        />
      )}
    </div>
  );
};

export default Matches;
