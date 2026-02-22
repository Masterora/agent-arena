import { apiClient } from "./client";
import type { CoinInfo } from "../types/match";

export const marketApi = {
  getSupportedCoins: async (): Promise<CoinInfo[]> => {
    const { data } = await apiClient.get<CoinInfo[]>("/api/market/coins");
    return data;
  },
};
