import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy, TrendingUp, Activity } from "lucide-react";
import { useMatch } from "../hooks/useMatches";
import { Loading } from "../components/common/Loading";
import { Button } from "../components/common/Button";

const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: match, isLoading } = useMatch(id!, false);

  if (isLoading) {
    return <Loading />;
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">比赛不存在</h2>
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
      {/* 头部 */}
      <div className="flex items-center gap-4">
        <Link to="/matches">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {match.config.trading_pair} 比赛详情
          </h1>
          <p className="text-gray-600 mt-1">
            创建于 {new Date(match.created_at).toLocaleString("zh-CN")}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-lg font-medium ${
            match.status === "completed"
              ? "bg-green-100 text-green-800"
              : match.status === "running"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {match.status === "completed"
            ? "已完成"
            : match.status === "running"
              ? "进行中"
              : "等待中"}
        </div>
      </div>

      {/* 配置信息 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">比赛配置</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">初始资金</div>
            <div className="text-lg font-semibold">
              ${match.config.initial_capital.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">交易对</div>
            <div className="text-lg font-semibold">
              {match.config.trading_pair}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">时间周期</div>
            <div className="text-lg font-semibold">
              {match.config.timeframe}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">比赛时长</div>
            <div className="text-lg font-semibold">
              {match.config.duration_steps} 步
            </div>
          </div>
        </div>
      </div>

      {/* 排行榜 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900">策略排行榜</h2>
        </div>

        <div className="space-y-3">
          {sortedParticipants.map((participant, index) => (
            <div
              key={participant.strategy_id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                index === 0
                  ? "border-yellow-400 bg-yellow-50"
                  : index === 1
                    ? "border-gray-300 bg-gray-50"
                    : index === 2
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200"
              }`}
            >
              {/* 排名 */}
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    index === 0
                      ? "bg-yellow-400 text-white"
                      : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                          ? "bg-orange-400 text-white"
                          : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {participant.rank || "-"}
                </div>

                {/* 策略名称 */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {participant.strategy_name || "未知策略"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {participant.total_trades} 笔交易 · 胜率{" "}
                    {participant.total_trades > 0
                      ? (
                          (participant.win_trades / participant.total_trades) *
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
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(participant.return_pct || 0) >= 0 ? "+" : ""}
                    {(participant.return_pct || 0).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500">
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">最佳收益</h3>
          </div>
          {sortedParticipants[0] && (
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                +{(sortedParticipants[0].return_pct || 0).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">
                {sortedParticipants[0].strategy_name}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">平均收益</h3>
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
                  ? "text-green-600"
                  : "text-red-600"
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
            <div className="text-sm text-gray-600">所有策略平均</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">总交易次数</h3>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {sortedParticipants.reduce((sum, p) => sum + p.total_trades, 0)}
            </div>
            <div className="text-sm text-gray-600">
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

      {/* 收益曲线图（占位） */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          收益曲线对比
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">图表功能即将上线...</p>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
