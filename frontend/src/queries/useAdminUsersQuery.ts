import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchAdminUsers } from '../requests/adminRequests';
import { useAuth } from '../hooks/useAuth';

export function useAdminUsersQuery() {
  const { token, isAuthenticated, user } = useAuth();
  const enabled =
    isAuthenticated && Boolean(token) && user?.role === 'ADMIN';

  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: () => fetchAdminUsers(token!),
    enabled,
  });
}
