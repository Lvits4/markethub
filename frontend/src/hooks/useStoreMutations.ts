import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import {
  createStore,
  deleteStore,
  updateStore,
  type CreateStorePayload,
  type UpdateStorePayload,
} from '../requests/storeRequests';

export function useCreateStoreMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStorePayload) => {
      if (!token) throw new Error('No autenticado');
      return createStore({ token }, body);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.myStores });
      void qc.invalidateQueries({ queryKey: queryKeys.publicStores });
      void qc.invalidateQueries({ queryKey: queryKeys.storesRejected });
      void qc.invalidateQueries({ queryKey: queryKeys.adminStores });
    },
  });
}

export function useUpdateStoreMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStorePayload }) => {
      if (!token) throw new Error('No autenticado');
      return updateStore({ token }, id, body);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.myStores });
      void qc.invalidateQueries({ queryKey: queryKeys.publicStores });
      void qc.invalidateQueries({ queryKey: queryKeys.adminStores });
    },
  });
}

export function useDeleteStoreMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('No autenticado');
      return deleteStore({ token }, id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.myStores });
      void qc.invalidateQueries({ queryKey: queryKeys.publicStores });
      void qc.invalidateQueries({ queryKey: queryKeys.adminStores });
    },
  });
}
