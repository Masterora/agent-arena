import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, TrendingUp, Users } from 'lucide-react';
import { Button } from '../components/common/Button';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-900">
          AI 策略竞技场
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          创建、测试和对比交易策略，让最优秀的策略脱颖而出
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/strategies">
            <Button size="lg">创建策略</Button>
          </Link>
          <Link to="/matches">
            <Button variant="secondary" size="lg">查看比赛</Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
            <Swords className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold">策略对战</h3>
          <p className="text-gray-600">
            多个策略同时运行，实时对比表现
          </p>
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
          <h3 className="text-xl font-semibold">社区分享</h3>
          <p className="text-gray-600">
            分享你的策略，学习他人的经验
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
