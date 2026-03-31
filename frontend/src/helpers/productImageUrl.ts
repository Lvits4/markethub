import type { Product } from '../types/product';

export function getPrimaryImageUrl(product: Product): string | null {
  const imgs = product.images;
  if (!imgs?.length) return null;
  const sorted = [...imgs].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  return sorted[0]?.url ?? null;
}
