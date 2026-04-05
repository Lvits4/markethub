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
      void qc.invalidateQueries({ queryKey: queryKeys.sellerDashboard });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerProducts });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerSalesReport });
      void qc.invalidateQueries({ queryKey: queryKeys.adminPlatformReport });
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
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.myStores });
      void qc.invalidateQueries({ queryKey: queryKeys.publicStores });
      void qc.invalidateQueries({ queryKey: queryKeys.adminStores });
      void qc.invalidateQueries({ queryKey: queryKeys.adminStore(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerStore(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerDashboard });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerProducts });
      void qc.invalidateQueries({ queryKey: queryKeys.adminPlatformReport });
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
      void qc.invalidateQueries({ queryKey: queryKeys.sellerDashboard });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerProducts });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerSalesReport });
      void qc.invalidateQueries({ queryKey: queryKeys.adminPlatformReport });
      void qc.invalidateQueries({ queryKey: queryKeys.ordersStore });
    },
  });
}
