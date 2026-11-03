import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi, authStorage, setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  // "checking" only while we verify a token that already exists in sessionStorage
  const [checking, setChecking] = useState(() => Boolean(authStorage.get()));

  const logout = useCallback(() => {
    authStorage.clear();
    setAdmin(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!authStorage.get()) return;
    let cancelled = false;
    adminApi
      .me()
      .then(({ admin: me }) => !cancelled && setAdmin(me))
      .catch(() => !cancelled && authStorage.clear())
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, admin: me } = await adminApi.login(email, password);
    authStorage.set(token);
    setAdmin(me);
  }, []);

  const value = useMemo(() => ({ admin, checking, login, logout }), [admin, checking, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
