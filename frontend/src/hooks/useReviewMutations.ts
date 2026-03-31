import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { useAuth } from './useAuth';
import {
  createReview,
  deleteReview,
  updateReview,
  type CreateReviewPayload,
  type UpdateReviewPayload,
} from '../requests/reviewRequests';

export function useCreateReviewMutation(productId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateReviewPayload, 'productId'>) => {
      if (!token) throw new Error('No autenticado');
      return createReview({ token }, { ...body, productId });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reviewsProduct(productId) });
      void qc.invalidateQueries({ queryKey: queryKeys.product(productId) });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateReviewMutation(productId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReviewPayload }) => {
      if (!token) throw new Error('No autenticado');
      return updateReview({ token }, id, body);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reviewsProduct(productId) });
      void qc.invalidateQueries({ queryKey: queryKeys.product(productId) });
    },
  });
}

export function useDeleteReviewMutation(productId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('No autenticado');
      return deleteReview({ token }, id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reviewsProduct(productId) });
      void qc.invalidateQueries({ queryKey: queryKeys.product(productId) });
    },
  });
}
