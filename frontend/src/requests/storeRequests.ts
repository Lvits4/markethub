import { apiPaths } from '../config/apiPaths';
import type { Store } from '../types/store';
import { fetchDefault, type FetchDefaultAuth } from './fetchDefault';

export type CreateStorePayload = {
  name: string;
  description?: string;
  logo?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type UpdateStorePayload = Partial<CreateStorePayload> & {
  logo?: string | null;
};

export async function fetchPublicStores(): Promise<Store[]> {
  return fetchDefault<Store[]>(apiPaths.stores);
}

export async function fetchStoreByLookupTerm(term: string): Promise<Store> {
  return fetchDefault<Store>(apiPaths.storeLookup(term));
}

export async function fetchMyStores(auth: FetchDefaultAuth): Promise<Store[]> {
  return fetchDefault<Store[]>(apiPaths.storesMy, { token: auth.token });
}

export async function createStore(
  auth: FetchDefaultAuth,
  body: CreateStorePayload,
): Promise<Store> {
  return fetchDefault<Store>(apiPaths.stores, {
    token: auth.token,
    method: 'POST',
    body,
  });
}

export async function updateStore(
  auth: FetchDefaultAuth,
  id: string,
  body: UpdateStorePayload,
): Promise<Store> {
  return fetchDefault<Store>(apiPaths.store(id), {
    token: auth.token,
    method: 'PATCH',
    body,
  });
}

export async function deleteStore(
  auth: FetchDefaultAuth,
  id: string,
): Promise<{ message: string }> {
  return fetchDefault<{ message: string }>(apiPaths.store(id), {
    token: auth.token,
    method: 'DELETE',
  });
}
