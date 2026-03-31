export const routePaths = {
  catalog: '/',
  product: '/product',
  productDetail: (id: string) => `/product/${id}`,
  login: '/auth/login',
  register: '/auth/register',
  favorites: '/favorites',
  cart: '/cart',
  settings: '/settings',
} as const;
