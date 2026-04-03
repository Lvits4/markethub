import { useEffect, useState } from 'react';
import type { PaginatedProducts, Product } from '../types/product';

/**
 * Concatena páginas de un listado paginado.
 * Con `placeholderData: keepPreviousData`, no mezcla la página 1 del resultado anterior
 * mientras `isPlaceholderData` es true (evita parpadeo al cambiar filtros).
 */
export function useAccumulatedProductList(
  page: number,
  result: PaginatedProducts | undefined,
  isPlaceholderData: boolean,
) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (!result?.data) return;
    if (page === 1 && isPlaceholderData) return;
    setItems((prev) => (page === 1 ? result.data : [...prev, ...result.data]));
  }, [result, page, isPlaceholderData]);

  return items;
}
