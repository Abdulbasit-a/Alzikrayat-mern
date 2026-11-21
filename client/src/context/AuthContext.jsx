// Auth state shared by the whole app (React Context API)

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../utils/api';
import { clearStoredUser, getStoredUser, storeUser } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  // While a stored session is being re-checked with the server, protected pages wait
  const [checking, setChecking] = useState(() => Boolean(getStoredUser()));

  const logout = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  // On first load, make sure the stored user still exists on the server
  useEffect(() => {
    if (!getStoredUser()) return;
    authAPI
      .me()
      .then((res) => {
        // /auth/me does not carry the previous-login time, so keep the one from the login response
        const refreshed = { ...res.data.user, lastLogin: getStoredUser()?.lastLogin };
        storeUser(refreshed);
        setUser(refreshed);
      })
      .catch((err) => {
        if (err.response?.status === 401) logout(); // stale session
      })
      .finally(() => setChecking(false));
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    storeUser(res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback((data) => authAPI.register(data), []);

  const value = useMemo(
    () => ({ user, checking, login, register, logout }),
    [user, checking, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
