import { apiPaths } from '../config/apiPaths';
import type { Review } from '../types/review';
import { fetchDefault, type FetchDefaultAuth } from './fetchDefault';

export type CreateReviewPayload = {
  productId: string;
  rating: number;
  comment?: string;
};

export type UpdateReviewPayload = {
  rating?: number;
  comment?: string;
};

export async function fetchReviewsByProduct(productId: string): Promise<Review[]> {
  return fetchDefault<Review[]>(apiPaths.reviewsByProduct(productId));
}

export async function createReview(
  auth: FetchDefaultAuth,
  body: CreateReviewPayload,
): Promise<Review> {
  return fetchDefault<Review>(apiPaths.reviews, {
    token: auth.token,
    method: 'POST',
    body,
  });
}

export async function updateReview(
  auth: FetchDefaultAuth,
  id: string,
  body: UpdateReviewPayload,
): Promise<Review> {
  return fetchDefault<Review>(apiPaths.review(id), {
    token: auth.token,
    method: 'PATCH',
    body,
  });
}

export async function deleteReview(
  auth: FetchDefaultAuth,
  id: string,
): Promise<void> {
  return fetchDefault<void>(apiPaths.review(id), {
    token: auth.token,
    method: 'DELETE',
  });
}
