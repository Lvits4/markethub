import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from '../hooks/useAuth';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
} from '../requests/notificationRequests';

export function useNotificationsQuery() {
  const { token, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => fetchNotifications(token!),
    enabled: isAuthenticated && Boolean(token),
  });
}

export function useUnreadNotificationsCountQuery() {
  const { token, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notificationsUnread,
    queryFn: () => fetchUnreadNotificationCount(token!),
    enabled: isAuthenticated && Boolean(token),
    refetchInterval: 60_000,
  });
}
