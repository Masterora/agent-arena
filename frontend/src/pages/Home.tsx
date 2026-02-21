import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, TrendingUp, Users } from 'lucide-react';
import { Button } from '../components/common/Button';
import { DashboardCharts } from '../components/home/DashboardCharts';
import { useStrategies } from '../hooks/useStrategies';
import { useMatches } from '../hooks/useMatches';

const Home: React.FC = () => {
  const { data: strategies = [] } = useStrategies();
  const { data: matches = [] } = useMatches();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-blue-600 rounded-2xl p-12 md:p-20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">AI 策略竞技场</h1>
          <p className="text-lg md:text-xl text-white/90">
            创建、测试和对比交易策略，让最优秀的策略脱颖而出
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/strategies">
              <Button size="lg">创建策略</Button>
            </Link>
            <Link to="/matches">
              <Button variant="secondary" size="lg">
                查看比赛
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-200">
            <div className="text-sm text-gray-500 mb-2 font-medium">总策略数</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              {strategies.length}
            </div>
            <div className="text-sm text-gray-600 mt-3">
              活跃策略 <span className="font-semibold text-primary-600">{strategies.filter((s) => s.total_matches > 0).length}</span> 个
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200">
            <div className="text-sm text-gray-500 mb-2 font-medium">总比赛数</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {matches.length}
            </div>
            <div className="text-sm text-gray-600 mt-3">
              已完成 <span className="font-semibold text-green-600">{matches.filter((m) => m.status === 'completed').length}</span> 场
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200">
            <div className="text-sm text-gray-500 mb-2 font-medium">平均胜率</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {strategies.length > 0
                ? (
                    (strategies.reduce((sum, s) => sum + s.win_rate, 0) /
                      strategies.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600 mt-3">所有策略平均胜率</div>
          </div>
        </div>
      </div>

      {/* 图表 */}
      {(strategies.length > 0 || matches.length > 0) && (
        <DashboardCharts
          strategiesCount={strategies.length}
          matchesCount={matches.length}
        />
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
            <Swords className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold">策略对战</h3>
          <p className="text-gray-600">多个策略同时运行，实时对比表现</p>
        </div>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold">多种市场环境</h3>
          <p className="text-gray-600">
            测试策略在上涨、下跌、震荡等不同行情下的表现
          </p>
        </div>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
            <Users className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold">数据可视化</h3>
          <p className="text-gray-600">丰富的图表展示，深入分析策略表现</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
