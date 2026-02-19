import { apiClient } from './client';
import { Strategy, StrategyCreate } from '../types/strategy';

export const strategiesApi = {
  // 获取策略列表
  getAll: async (): Promise<Strategy[]> => {
    const response = await apiClient.get('/api/strategies/');
    return response.data;
  },

  // 获取单个策略
  getById: async (id: string): Promise<Strategy> => {
    const response = await apiClient.get(`/api/strategies/${id}`);
    return response.data;
  },

  // 创建策略
  create: async (data: StrategyCreate): Promise<Strategy> => {
    const response = await apiClient.post('/api/strategies/', data);
    return response.data;
  },

  // 更新策略
  update: async (id: string, data: Partial<StrategyCreate>): Promise<Strategy> => {
    const response = await apiClient.put(`/api/strategies/${id}`, data);
    return response.data;
  },

  // 删除策略
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/strategies/${id}`);
  },
};
