import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { strategiesApi } from "../api/strategies";
import type { StrategyCreate } from "../types/strategy";

export const useStrategies = () => {
  return useQuery({
    queryKey: ["strategies"],
    queryFn: strategiesApi.getAll,
    staleTime: 60_000, // 1 分钟内不重复请求
  });
};

export const useStrategy = (id: string) => {
  return useQuery({
    queryKey: ["strategy", id],
    queryFn: () => strategiesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateStrategy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StrategyCreate) => strategiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
};

export const useDeleteStrategy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => strategiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
};

export const useUpdateStrategy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StrategyCreate> }) =>
      strategiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
};
