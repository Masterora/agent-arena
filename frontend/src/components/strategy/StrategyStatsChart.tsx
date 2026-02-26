import React from "react";
import type { Strategy } from "../../types/strategy";
import styles from "./StrategyStatsChart.module.css";

interface StrategyStatsChartProps {
  strategies: Strategy[];
}

const RANK_CLASS: Record<number, string> = {
  1: styles.rank_1,
  2: styles.rank_2,
  3: styles.rank_3,
};

const RANK_LABEL: Record<number, string> = {
  1: "①",
  2: "②",
  3: "③",
};

export const StrategyStatsChart: React.FC<StrategyStatsChartProps> = ({
  strategies,
}) => {
  const data = strategies
    .filter((s) => s.total_matches > 0)
    .sort((a, b) => b.avg_return - a.avg_return)
    .slice(0, 10);

  if (data.length === 0) return null;

  const maxAbsReturn = Math.max(...data.map((s) => Math.abs(s.avg_return)), 0.01);

  const getReturnColor = (v: number) => {
    if (v > 0) return "#10b981";
    if (v < 0) return "#fb7185";
    return "#475569";
  };

  const getReturnClass = (v: number) => {
    if (v > 0) return styles.returnPos;
    if (v < 0) return styles.returnNeg;
    return styles.returnZero;
  };

  return (
    <div className={styles.container}>
      <p className={styles.title}>策略性能排行</p>

      {/* 表头 */}
      <div className={styles.header}>
        <span>#</span>
        <span>策略</span>
        <span>平均收益</span>
        <span style={{ textAlign: "right" }}>胜率</span>
        <span style={{ textAlign: "right" }}>场次</span>
      </div>

      {/* 行列表 */}
      <div className={styles.list}>
        {data.map((s, i) => {
          const rank = i + 1;
          const pct = (Math.abs(s.avg_return) / maxAbsReturn) * 100;
          return (
            <div key={s.id} className={styles.row}>
              {/* 排名 */}
              <span className={`${styles.rank} ${RANK_CLASS[rank] ?? styles.rank_n}`}>
                {RANK_LABEL[rank] ?? rank}
              </span>

              {/* 策略名 */}
              <span className={styles.name} title={s.name}>{s.name}</span>

              {/* 收益率 + 进度条 */}
              <div className={styles.returnCol}>
                <span className={`${styles.returnVal} ${getReturnClass(s.avg_return)}`}>
                  {s.avg_return > 0 ? "+" : ""}{s.avg_return.toFixed(2)}%
                </span>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getReturnColor(s.avg_return),
                    }}
                  />
                </div>
              </div>

              {/* 胜率 */}
              <span className={styles.winRate}>
                {(s.win_rate * 100).toFixed(1)}%
              </span>

              {/* 场次 */}
              <span className={styles.matches}>{s.total_matches}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

