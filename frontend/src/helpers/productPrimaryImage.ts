import type { Product, ProductImage } from '../types/product';

/**
 * Detecta si dos valores de URL/ruta apuntan al mismo fichero almacenado
 * (p. ej. logo de tienda duplicado erróneamente en product_images).
 */
export function sameStorageAsset(a: string, b: string): boolean {
  const x = a.trim();
  const y = b.trim();
  if (!x || !y) return false;
  if (x === y) return true;

  const pathParam = (s: string): string | null => {
    const m = s.match(/[?&]path=([^&]+)/);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
  };

  const px = pathParam(x);
  const py = pathParam(y);
  if (px && py && px === py) return true;
  if (px && (y === px || y.endsWith(px))) return true;
  if (py && (x === py || x.endsWith(py))) return true;

  return false;
}

export function sortedProductImages(product: Product): ProductImage[] {
  return [...(product.images ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}

/** URL de la primera imagen de producto que no sea el logo de la tienda. */
export function primaryProductImageUrl(product: Product): string | undefined {
  const logo = product.store?.logo?.trim() ?? '';
  const ordered = sortedProductImages(product);
  for (const img of ordered) {
    const url = img.url?.trim() ?? '';
    if (!url) continue;
    if (logo && sameStorageAsset(url, logo)) continue;
    return url;
  }
  return undefined;
}

/** Imágenes para la galería: ordenadas y sin la fila que duplica solo el logo de tienda. */
export function galleryProductImages(product: Product): ProductImage[] {
  const logo = product.store?.logo?.trim() ?? '';
  const ordered = sortedProductImages(product);
  if (!logo) return ordered;
  return ordered.filter((img) => !sameStorageAsset(img.url?.trim() ?? '', logo));
}
