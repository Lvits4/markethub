import { apiPaths } from '../config/apiPaths';
import type { FavoriteWithProduct } from '../types/favorites';
import { fetchDefault, type FetchDefaultAuth } from './fetchDefault';

export async function fetchFavorites(
  auth: FetchDefaultAuth,
): Promise<FavoriteWithProduct[]> {
  return fetchDefault<FavoriteWithProduct[]>(apiPaths.favorites, {
    token: auth.token,
  });
}

export async function checkFavorite(
  auth: FetchDefaultAuth,
  productId: string,
): Promise<boolean> {
  return fetchDefault<boolean>(apiPaths.favoriteCheck(productId), {
    token: auth.token,
  });
}

export async function addFavorite(
  auth: FetchDefaultAuth,
  productId: string,
): Promise<FavoriteWithProduct> {
  return fetchDefault<FavoriteWithProduct>(apiPaths.favoriteByProduct(productId), {
    method: 'POST',
    token: auth.token,
  });
}

export async function removeFavorite(
  auth: FetchDefaultAuth,
  productId: string,
): Promise<null> {
  return fetchDefault<null>(apiPaths.favoriteByProduct(productId), {
    method: 'DELETE',
    token: auth.token,
  });
}
