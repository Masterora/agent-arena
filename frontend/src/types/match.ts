export type MatchStatus = "pending" | "running" | "completed" | "failed";
export type MarketType = "random" | "trending" | "ranging";
export type MarketSource =
  | "simulated"
  | "coingecko_historical"
  | "coingecko_realtime";

export interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
}

export interface MatchParticipant {
  strategy_id: string;
  strategy_name?: string;
  final_value?: number;
  return_pct?: number;
  total_trades: number;
  win_trades: number;
  rank?: number;
  max_drawdown?: number;
  sharpe_ratio?: number;
  value_history?: number[];
}

export interface MatchConfig {
  initial_capital: number;
  trading_pair: string;
  timeframe: string;
  duration_steps: number;
  market_type?: MarketType;
  market_source?: MarketSource;
  coin_id?: string;
}

export interface ExecutionEntry {
  step: number;
  strategy_id: string;
  action: { type: string; asset?: string; amount?: number };
  portfolio: {
    cash: number;
    positions: Record<string, number>;
    total_value: number;
  };
  price: number;
}

export interface MatchLogEntry {
  step: number;
  data: { logs: ExecutionEntry[] };
}

export interface Match {
  id: string;
  status: MatchStatus;
  error_message?: string;
  config: MatchConfig;
  created_at: string;
  start_time?: string;
  end_time?: string;
  participants: MatchParticipant[];
  participants_count?: number;
  logs?: MatchLogEntry[];
}

export interface RunMatchRequest {
  strategy_ids: string[];
  market_type: MarketType;
  market_source: MarketSource;
  coin_id: string;
  duration_steps: number;
  initial_capital: number;
}
