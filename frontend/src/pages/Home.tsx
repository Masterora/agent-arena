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
      <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div className="space-y-6">
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
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">
          概览
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card stat-card-cyan">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">总策略数</div>
            <div className="text-3xl font-bold num text-slate-100">{strategies.length}</div>
            <div className="text-xs text-slate-600 mt-2">
              活跃 <span className="text-cyan-400">{strategies.filter((s) => s.total_matches > 0).length}</span> 个
            </div>
          </div>

          <div className="stat-card stat-card-amber">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">总比赛数</div>
            <div className="text-3xl font-bold num text-slate-100">{matches.length}</div>
            <div className="text-xs text-slate-600 mt-2">
              已完成 <span className="text-emerald-400">{matches.filter((m) => m.status === "completed").length}</span> 场
            </div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">平均胜率</div>
            <div className="text-3xl font-bold num text-slate-100">
              {strategies.length > 0
                ? ((strategies.reduce((sum, s) => sum + s.win_rate, 0) / strategies.length) * 100).toFixed(1)
                : "0.0"}
              <span className="text-lg text-slate-500">%</span>
            </div>
            <div className="text-xs text-slate-600 mt-2">所有策略加权均值</div>
          </div>

          <div className="stat-card stat-card-purple">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">平均参赛数</div>
            <div className="text-3xl font-bold num text-slate-100">
              {matches.length > 0
                ? (matches.reduce((sum, m) => sum + (m.participants?.length ?? 0), 0) / matches.length).toFixed(1)
                : "0.0"}
              <span className="text-lg text-slate-500"> 个</span>
            </div>
            <div className="text-xs text-slate-600 mt-2">每场比赛参赛策略</div>
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
