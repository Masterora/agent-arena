export type StrategyType = 'mean_reversion' | 'momentum' | 'dca' | 'custom';

export interface StrategyParams {
  lookback_period: number;
  buy_threshold: number;
  sell_threshold: number;
  position_size: number;
  max_position_pct?: number;
}

export interface Strategy {
  id: string;
  name: string;
  type: StrategyType;
  params: StrategyParams;
  code?: string;
  author?: string | null;
  created_at: string;
  total_matches: number;
  wins: number;
  win_rate: number;
  avg_return: number;
}

export interface StrategyCreate {
  name: string;
  type: StrategyType;
  params: StrategyParams;
  code?: string;
}
