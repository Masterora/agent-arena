export type MatchStatus = "pending" | "running" | "completed" | "failed";
export type MarketType = "random" | "trending" | "ranging";

export interface MatchParticipant {
  strategy_id: string;
  strategy_name?: string;
  final_value?: number;
  return_pct?: number;
  total_trades: number;
  win_trades: number;
  rank?: number;
}

export interface MatchConfig {
  initial_capital: number;
  trading_pair: string;
  timeframe: string;
  duration_steps: number;
  market_type?: MarketType;
}

export interface Match {
  id: string;
  status: MatchStatus;
  config: MatchConfig;
  created_at: string;
  start_time?: string;
  end_time?: string;
  participants: MatchParticipant[];
  participants_count?: number;
  logs?: string[];
}

export interface RunMatchRequest {
  strategy_ids: string[];
  market_type: MarketType;
  duration_steps: number;
  initial_capital: number;
}
