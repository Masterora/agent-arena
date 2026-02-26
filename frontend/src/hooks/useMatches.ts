import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesApi } from "../api/matches";
import type { RunMatchRequest } from "../types/match";

export const useMatches = () => {
  return useQuery({
    queryKey: ["matches"],
    queryFn: matchesApi.getAll,
    refetchInterval: (query) => {
      const data = query.state.data;
      return Array.isArray(data) &&
        data.some((m) => m.status === "running" || m.status === "pending")
        ? 3000
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
        ? 3000
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
