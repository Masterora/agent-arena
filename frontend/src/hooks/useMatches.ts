import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesApi } from "../api/matches";
import type { RunMatchRequest } from "../types/match";

export const useMatches = () => {
  return useQuery({
    queryKey: ["matches"],
    queryFn: matchesApi.getAll,
    staleTime: 30_000, // 无进行中比赛时 30 秒内不重复请求
    refetchInterval: (query) => {
      const data = query.state.data;
      return Array.isArray(data) &&
        data.some((m) => m.status === "running" || m.status === "pending")
        ? 2000
        : false;
    },
  });
};

export const useMatch = (id: string, includeLogs = false) => {
  return useQuery({
    queryKey: ["match", id, includeLogs],
    queryFn: () => matchesApi.getById(id, includeLogs),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "running" || data?.status === "pending"
        ? 2000
        : false;
    },
  });
};

export const useRunMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RunMatchRequest) => matchesApi.run(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
};

export const useDeleteMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => matchesApi.deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};
