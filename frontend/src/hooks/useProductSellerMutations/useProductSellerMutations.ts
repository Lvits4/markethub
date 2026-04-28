import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { useAuth } from '../useAuth/useAuth';
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../../requests/productRequests/productRequests';

export function useCreateProductMutation(storeId: string | undefined) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateProductPayload, 'storeId'> & { storeId?: string }) => {
      if (!token) throw new Error('No autenticado');
      const sid = body.storeId ?? storeId;
      return createProduct({ token }, { ...body, storeId: sid });
    },
    onSuccess: (_, vars) => {
      const sid = vars.storeId ?? storeId;
      if (sid) {
        void qc.invalidateQueries({
          queryKey: ['products', 'store', sid],
        });
      }
      void qc.invalidateQueries({ queryKey: queryKeys.adminProducts });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerProducts });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerDashboard() });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductMutation(storeId: string | undefined) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductPayload }) => {
      if (!token) throw new Error('No autenticado');
      return updateProduct({ token }, id, body);
    },
    onSuccess: () => {
      if (storeId) {
        void qc.invalidateQueries({ queryKey: ['products', 'store', storeId] });
      }
      void qc.invalidateQueries({ queryKey: queryKeys.adminProducts });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerProducts });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerDashboard() });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductMutation(storeId: string | undefined) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('No autenticado');
      return deleteProduct({ token }, id);
    },
    onSuccess: () => {
      if (storeId) {
        void qc.invalidateQueries({ queryKey: ['products', 'store', storeId] });
      }
      void qc.invalidateQueries({ queryKey: queryKeys.adminProducts });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerProducts });
      void qc.invalidateQueries({ queryKey: queryKeys.sellerDashboard() });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
