import { apiPaths } from '../config/apiPaths';
import { fetchDefault } from './fetchDefault';
import type { Category } from '../types/category';

export async function fetchCategoriesTree(): Promise<Category[]> {
  return fetchDefault<Category[]>(apiPaths.categories);
}

export async function fetchCategoriesFlat(): Promise<Category[]> {
  return fetchDefault<Category[]>(apiPaths.categoriesFlat);
}
