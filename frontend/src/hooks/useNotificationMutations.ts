import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '../requests/notificationRequests';

export function useMarkNotificationReadMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('No autenticado');
      return markNotificationRead(token, id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications });
      void qc.invalidateQueries({ queryKey: queryKeys.notificationsUnread });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error('No autenticado');
      return markAllNotificationsRead(token);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications });
      void qc.invalidateQueries({ queryKey: queryKeys.notificationsUnread });
    },
  });
}
