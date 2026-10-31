import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';
import { useToast } from './ui';

// Admin data is always fetched fresh (these calls carry the token, so the server never caches them)
export const useAdminQuery = (key, path, options = {}) =>
  useQuery({
    queryKey: ['admin', ...key],
    queryFn: () => adminFetch(path),
    staleTime: 0,
    retry: false,
    ...options,
  });

// Runs a write, shows a toast, then refreshes every cached query so the public pages update too
export const useAdminAction = (mutationFn, { success, onDone } = {}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries();
      if (success) {
        toast(success);
      }
      onDone?.(data, variables);
    },
    onError: (error) => toast(error.message, 'error'),
  });
};
