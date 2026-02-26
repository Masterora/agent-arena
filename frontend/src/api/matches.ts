import { apiClient } from "./client";
import type { Match, RunMatchRequest } from "../types/match";

export const matchesApi = {
  // 获取比赛列表
  getAll: async (): Promise<Match[]> => {
    const response = await apiClient.get("/api/matches/");
    return response.data;
  },

  // 获取比赛详情
  getById: async (id: string, includeLogs = false): Promise<Match> => {
    const response = await apiClient.get(`/api/matches/${id}`, {
      params: { include_logs: includeLogs },
    });
    return response.data;
  },

  // 运行比赛（异步，立即返回 match_id）
  run: async (data: RunMatchRequest): Promise<{ match_id: string; status: string; message: string }> => {
    const response = await apiClient.post("/api/matches/run", data);
    return response.data;
  },

  // 删除比赛
  deleteMatch: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/matches/${id}`);
  },
};
