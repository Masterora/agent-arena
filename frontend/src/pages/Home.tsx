import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { DashboardCharts } from "../components/home/DashboardCharts";
import { useStrategies } from "../hooks/useStrategies";
import { useMatches } from "../hooks/useMatches";

const Home: React.FC = () => {
  const { data: strategies = [] } = useStrategies();
  const { data: matches = [] } = useMatches();

  return (
    <div className="space-section">
      {/* Hero Section */}
      <div className="card card-gradient group">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-gradient text-5xl md:text-6xl font-bold leading-tight mb-4">
              AI 策略竞技场
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
              创建、测试和对比交易策略，让最优秀的策略脱颖而出
            </p>
          </div>
          <div className="flex gap-4 pt-4 flex-wrap justify-center">
            <Link to="/strategies?create=true">
              <Button size="lg" className="btn-primary">
                创建策略
              </Button>
            </Link>
            <Link to="/matches">
              <Button size="lg" className="btn-outline">
                查看比赛
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gradient text-center">
          策略及比赛概览
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 总策略数 */}
          <div className="card card-gradient group hover:shadow-glow-lg transform group-hover:-translate-y-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-400 mb-2">
                  总策略数
                </div>
                <div className="text-gradient text-4xl font-bold">
                  {strategies.length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center text-indigo-400 text-xl border border-indigo-500/30">
                📊
              </div>
            </div>
            <div className="text-sm text-slate-500 pt-4 border-t border-slate-700/50">
              活跃策略{" "}
              <span className="font-semibold text-indigo-400">
                {strategies.filter((s) => s.total_matches > 0).length}
              </span>{" "}
              个
            </div>
          </div>

          {/* 总比赛数 */}
          <div className="card card-gradient group hover:shadow-glow-lg transform group-hover:-translate-y-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-400 mb-2">
                  总比赛数
                </div>
                <div className="text-gradient-warm text-4xl font-bold">
                  {matches.length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-amber-400 text-xl border border-amber-500/30">
                🏆
              </div>
            </div>
            <div className="text-sm text-slate-500 pt-4 border-t border-slate-700/50">
              已完成{" "}
              <span className="font-semibold text-emerald-400">
                {matches.filter((m) => m.status === "completed").length}
              </span>{" "}
              场
            </div>
          </div>

          {/* 平均胜率 */}
          <div className="card card-gradient group hover:shadow-glow-lg transform group-hover:-translate-y-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-400 mb-2">
                  平均胜率
                </div>
                <div className="text-gradient-cool text-4xl font-bold">
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
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 text-xl border border-cyan-500/30">
                📈
              </div>
            </div>
            <div className="text-sm text-slate-500 pt-4 border-t border-slate-700/50">
              所有策略平均胜率
            </div>
          </div>

          {/* 平均参赛策略 */}
          <div className="card card-gradient group hover:shadow-glow-lg transform group-hover:-translate-y-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-400 mb-2">
                  平均参赛数
                </div>
                <div className="text-4xl font-bold text-indigo-400">
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
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center text-purple-400 text-xl border border-purple-500/30">
                👥
              </div>
            </div>
            <div className="text-sm text-slate-500 pt-4 border-t border-slate-700/50">
              每场比赛参赛策略
            </div>
          </div>
        </div>
      </div>

      {/* 图表 */}
      {(strategies.length > 0 || matches.length > 0) && (
        <DashboardCharts matches={matches} strategies={strategies} />
      )}
    </div>
  );
};

export default Home;
