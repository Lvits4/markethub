import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser, LoginResult } from '../../types/user';

const TOKEN_KEY = 'mh_access_token';
const USER_KEY = 'mh_user';

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginResult) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): { token: string | null; user: AuthUser | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  const t = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  if (!t || !raw) {
    if (t) localStorage.removeItem(TOKEN_KEY);
    if (raw) localStorage.removeItem(USER_KEY);
    return { token: null, user: null };
  }
  try {
    return { token: t, user: JSON.parse(raw) as AuthUser };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ token, user }, setAuth] = useState(readStoredAuth);

  const login = useCallback((data: LoginResult) => {
    setAuth({ user: data.user, token: data.accessToken });
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }, []);

  const logout = useCallback(() => {
    setAuth({ token: null, user: null });
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const setUserPersist = useCallback((next: AuthUser | null) => {
    setAuth((prev) => {
      if (next) {
        localStorage.setItem(USER_KEY, JSON.stringify(next));
      } else {
        localStorage.removeItem(USER_KEY);
      }
      return { ...prev, user: next };
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser: setUserPersist,
    }),
    [user, token, login, logout, setUserPersist],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
