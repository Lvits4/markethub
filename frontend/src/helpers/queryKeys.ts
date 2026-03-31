export const queryKeys = {
  categories: ['categories'] as const,
  categoriesFlat: ['categories', 'flat'] as const,
  products: (filters?: Record<string, unknown>) => ['products', filters ?? {}] as const,
  product: (id: string) => ['product', id] as const,
  cart: ['cart'] as const,
  favorites: ['favorites'] as const,
  favoriteCheck: (productId: string) => ['favorites', 'check', productId] as const,
};
