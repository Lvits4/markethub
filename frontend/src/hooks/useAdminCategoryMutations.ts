import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import {
  createCategory,
  deleteCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
  updateCategory,
} from '../requests/categoryRequests';
import { useAuth } from './useAuth';

export function useCreateCategoryMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCategoryPayload) => {
      if (!token) throw new Error('No autenticado');
      return createCategory(token, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categoriesFlat });
    },
  });
}

export function useUpdateCategoryMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryPayload }) => {
      if (!token) throw new Error('No autenticado');
      return updateCategory(token, id, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categoriesFlat });
    },
  });
}

export function useDeleteCategoryMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('No autenticado');
      return deleteCategory(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categoriesFlat });
    },
  });
}
