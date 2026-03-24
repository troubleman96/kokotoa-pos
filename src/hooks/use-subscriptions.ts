import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const subscriptionQueryKeys = {
  all: ['subscription'] as const,
  status: ['subscription', 'status'] as const,
  packages: ['subscription', 'packages'] as const,
};

export const useSubscriptionPackages = (enabled = true) =>
  useQuery({
    queryKey: subscriptionQueryKeys.packages,
    queryFn: async () => {
      const response = await subscriptionApi.getPackages();
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useSubscriptionStatus = (enabled = true) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: subscriptionQueryKeys.status,
    queryFn: async () => {
      const response = await subscriptionApi.getStatus();
      return response.data;
    },
    enabled: enabled && isAuthenticated,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useRefreshSubscriptionQueries = () => {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.status }),
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.packages }),
    ]);
  };
};
