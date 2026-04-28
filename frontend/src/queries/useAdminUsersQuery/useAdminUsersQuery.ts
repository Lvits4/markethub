import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchAdminUsers } from '../../requests/adminRequests/adminRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

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
