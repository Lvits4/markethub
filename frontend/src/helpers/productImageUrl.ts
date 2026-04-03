import { publicStorageImageSrc } from './storagePublicUrl';
import type { Product, ProductImage } from '../types/product';

function sortImages(imgs: ProductImage[]): ProductImage[] {
  return [...imgs].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}

export function getSortedProductImages(product: Product): ProductImage[] {
  const imgs = product.images;
  if (!imgs?.length) return [];
  return sortImages(imgs);
}

export function getPrimaryImageUrl(product: Product): string | null {
  const sorted = getSortedProductImages(product);
  const raw = sorted[0]?.url;
  if (!raw?.trim()) return null;
  const src = publicStorageImageSrc(raw);
  return src || null;
}
