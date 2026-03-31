import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../helpers/queryKeys';
import { fetchCart } from '../requests/cartRequests';
import { useAuth } from '../hooks/useAuth';

export function useCartQuery(enabledOverride = true) {
  const { token, isAuthenticated } = useAuth();
  const enabled = Boolean(isAuthenticated && token && enabledOverride);

  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => fetchCart({ token }),
    enabled,
  });
}
