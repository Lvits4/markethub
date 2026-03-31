import { apiPaths } from '../config/apiPaths';
import type { NotificationRow } from '../types/notification';
import { fetchDefault } from './fetchDefault';

export async function fetchNotifications(token: string) {
  return fetchDefault<NotificationRow[]>(apiPaths.notifications, { token });
}

export async function fetchUnreadNotificationCount(token: string) {
  return fetchDefault<number>(apiPaths.notificationsUnreadCount, { token });
}

export async function markNotificationRead(token: string, id: string) {
  return fetchDefault<NotificationRow>(apiPaths.notificationRead(id), {
    token,
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead(token: string) {
  return fetchDefault<void>(apiPaths.notificationsReadAll, {
    token,
    method: 'PATCH',
  });
}
