import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../helpers/queryKeys/queryKeys';
import { fetchCart } from '../../requests/cartRequests/cartRequests';
import { useAuth } from '../../hooks/useAuth/useAuth';

export function useCartQuery(enabledOverride = true) {
  const { token, isAuthenticated } = useAuth();
  const enabled = Boolean(isAuthenticated && token && enabledOverride);

  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => fetchCart({ token }),
    enabled,
  });
}
