import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import { fetchUserProfile } from '../requests/userRequests';

export function useUserProfileQuery() {
  const { token, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: () => fetchUserProfile(token!),
    enabled: isAuthenticated && Boolean(token),
  });
}
