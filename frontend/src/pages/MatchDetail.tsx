import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Activity,
  BarChart3,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useMatch } from "../hooks/useMatches";
import { Loading } from "../components/common/Loading";
import { Button } from "../components/common/Button";
import { PerformanceChart } from "../components/charts/PerformanceChart";
import { ComparisonChart } from "../components/charts/ComparisonChart";
import { TradeDistributionChart } from "../components/charts/TradeDistributionChart";
import { RadarComparisonChart } from "../components/charts/RadarComparisonChart";
import { PortfolioValueChart } from "../components/charts/PortfolioValueChart";

const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: match, isLoading, isError, refetch } = useMatch(id ?? "", true);
  const [activeTab, setActiveTab] = useState<"overview" | "charts">("overview");

  if (!id) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">请从比赛列表选择一场比赛</h2>
        <Link to="/matches">
          <Button variant="secondary">返回比赛列表</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">加载失败，请重试</h2>
        <div className="flex gap-3 justify-center mt-4">
          <Button variant="primary" onClick={() => refetch()}>
            重试
          </Button>
          <Link to="/matches">
            <Button variant="secondary">返回比赛列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">比赛不存在</h2>
        <Link to="/matches">
          <Button variant="secondary">返回比赛列表</Button>
        </Link>
      </div>
    );
  }

  const sortedParticipants = [...match.participants].sort(
    (a, b) => (a.rank || 999) - (b.rank || 999),
  );

  return (
    <div className="space-y-6">
      {/* 头部卡片 */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/matches">
            <Button variant="secondary" size="sm" className="btn-secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gradient">
              {match.config.trading_pair} 比赛详情
            </h1>
            <p className="text-slate-400 mt-1">
              创建于 {new Date(match.created_at).toLocaleString("zh-CN")}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              match.status === "completed"
                ? "status-completed"
                : match.status === "running"
                  ? "status-running"
                  : match.status === "failed"
                    ? "status-failed"
                    : "status-pending"
            }`}
          >
            {match.status === "completed"
              ? "已完成"
              : match.status === "running"
                ? "进行中"
                : match.status === "failed"
                  ? "失败"
                  : "等待中"}
          </div>
        </div>
      </div>

      {/* 运行中提示 */}
      {(match.status === "running" || match.status === "pending") && (
        <div className="card flex items-center gap-3 text-blue-400">
          <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
          <span className="text-sm">比赛正在运行中，结果将在几秒内自动刷新…</span>
        </div>
      )}
      {/* 失败原因 */}
      {match.status === "failed" && match.error_message && (
        <div className="card flex items-start gap-3 bg-red-500/5 border-red-500/20">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">比赛执行失败</p>
            <p className="text-sm text-slate-400">{match.error_message}</p>
          </div>
        </div>
      )}

      {/* 标签页切换 */}
      <div className="card pt-0 pb-0 border-b">
        <div className="flex gap-0 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "overview"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 flex items-center gap-2 ${
              activeTab === "charts"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            数据分析
          </button>
        </div>
      </div>

      {/* 概览标签页 */}
      {activeTab === "overview" && (
        <>
          {/* 配置信息 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gradient mb-4">
              比赛配置
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="form-section">
                <div className="text-sm text-slate-400 mb-2">初始资金</div>
                <div className="text-lg font-semibold text-slate-100">
                  ${match.config.initial_capital.toLocaleString()}
                </div>
              </div>
              <div className="form-section">
                <div className="text-sm text-slate-400 mb-2">交易对</div>
                <div className="text-lg font-semibold text-slate-100">
                  {match.config.trading_pair}
                </div>
              </div>
              <div className="form-section">
                <div className="text-sm text-slate-400 mb-2">时间周期</div>
                <div className="text-lg font-semibold text-slate-100">
                  {match.config.timeframe}
                </div>
              </div>
              <div className="form-section">
                <div className="text-sm text-slate-400 mb-2">比赛时长</div>
                <div className="text-lg font-semibold text-slate-100">
                  {match.config.duration_steps} 步
                </div>
              </div>
            </div>
          </div>

          {/* 排行榜 */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-6 w-6 text-amber-400" />
              <h2 className="text-lg font-semibold text-gradient">
                策略排行榜
              </h2>
            </div>

            <div className="space-y-3">
              {sortedParticipants.map((participant, index) => (
                <div
                  key={participant.strategy_id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                    index === 0
                      ? "border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20"
                      : index === 1
                        ? "border-slate-600/50 bg-slate-800/20 hover:bg-slate-800/40"
                        : index === 2
                          ? "border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20"
                          : "border-slate-700/30 hover:bg-slate-800/20"
                  }`}
                >
                  {/* 排名 */}
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                        index === 0
                          ? "bg-amber-500 text-white"
                          : index === 1
                            ? "bg-slate-600 text-white"
                            : index === 2
                              ? "bg-orange-500 text-white"
                              : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {participant.rank || "-"}
                    </div>

                    {/* 策略名称 */}
                    <div className="flex-1">
                      <div className="font-semibold text-slate-100">
                        {participant.strategy_name || "未知策略"}
                      </div>
                      <div className="text-sm text-slate-400">
                        {participant.total_trades} 笔交易 · 胜率{" "}
                        {participant.total_trades > 0
                          ? (
                              (participant.win_trades /
                                participant.total_trades) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>

                    {/* 收益 */}
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          (participant.return_pct || 0) >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {(participant.return_pct || 0) >= 0 ? "+" : ""}
                        {(participant.return_pct || 0).toFixed(2)}%
                      </div>
                      <div className="text-sm text-slate-400">
                        ${(participant.final_value || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 统计对比 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-sm group hover:shadow-glow-lg">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold text-slate-100">最佳收益</h3>
              </div>
              {sortedParticipants[0] && (
                <div>
                  <div
                    className={`text-3xl font-bold mb-1 ${
                      (sortedParticipants[0].return_pct || 0) >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {(sortedParticipants[0].return_pct || 0) >= 0 ? "+" : ""}
                    {(sortedParticipants[0].return_pct || 0).toFixed(2)}%
                  </div>
                  <div className="text-sm text-slate-400">
                    {sortedParticipants[0].strategy_name}
                  </div>
                </div>
              )}
            </div>

            <div className="card-sm group hover:shadow-glow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-slate-100">平均收益</h3>
              </div>
              <div>
                <div
                  className={`text-3xl font-bold mb-1 ${
                    sortedParticipants.length > 0 &&
                    sortedParticipants.reduce(
                      (sum, p) => sum + (p.return_pct || 0),
                      0,
                    ) /
                      sortedParticipants.length >=
                      0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {sortedParticipants.length > 0
                    ? (
                        sortedParticipants.reduce(
                          (sum, p) => sum + (p.return_pct || 0),
                          0,
                        ) / sortedParticipants.length
                      ).toFixed(2)
                    : 0}
                  %
                </div>
                <div className="text-sm text-slate-400">所有策略平均</div>
              </div>
            </div>

            <div className="card-sm group hover:shadow-glow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h3 className="font-semibold text-slate-100">总交易次数</h3>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-400 mb-1">
                  {sortedParticipants.reduce(
                    (sum, p) => sum + p.total_trades,
                    0,
                  )}
                </div>
                <div className="text-sm text-slate-400">
                  平均{" "}
                  {sortedParticipants.length > 0
                    ? (
                        sortedParticipants.reduce(
                          (sum, p) => sum + p.total_trades,
                          0,
                        ) / sortedParticipants.length
                      ).toFixed(1)
                    : 0}{" "}
                  笔/策略
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 数据分析标签页 */}
      {activeTab === "charts" && (
        <div className="space-y-6">
          {/* 收益曲线 */}
          <PerformanceChart
            participants={sortedParticipants}
            steps={match.config.duration_steps}
            initialCapital={match.config.initial_capital}
            logs={match.logs}
          />

          {/* 资金变化 */}
          <PortfolioValueChart
            participants={sortedParticipants}
            initialCapital={match.config.initial_capital}
            steps={match.config.duration_steps}
            logs={match.logs}
          />

          {/* 对比图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComparisonChart participants={sortedParticipants} />
            <TradeDistributionChart participants={sortedParticipants} />
          </div>

          {/* 雷达图 */}
          <RadarComparisonChart participants={sortedParticipants} />
        </div>
      )}
    </div>
  );
};

export default MatchDetail;
