import { apiPaths } from '../config/apiPaths';
import { fetchDefault } from './fetchDefault';
import type { Category } from '../types/category';

export async function fetchCategoriesTree(): Promise<Category[]> {
  return fetchDefault<Category[]>(apiPaths.categories);
}

export async function fetchCategoriesFlat(): Promise<Category[]> {
  return fetchDefault<Category[]>(apiPaths.categoriesFlat);
}

export type CreateCategoryPayload = {
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export function createCategory(token: string, body: CreateCategoryPayload) {
  return fetchDefault<Category>(apiPaths.categories, {
    token,
    method: 'POST',
    body,
  });
}

export function updateCategory(
  token: string,
  id: string,
  body: UpdateCategoryPayload,
) {
  return fetchDefault<Category>(apiPaths.category(id), {
    token,
    method: 'PATCH',
    body,
  });
}

export function deactivateCategory(token: string, id: string) {
  return fetchDefault<void>(apiPaths.category(id), {
    token,
    method: 'DELETE',
  });
}
