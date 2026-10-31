import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { adminFetch, getToken, setToken } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    setToken('');
    setSignedIn(false);
    queryClient.removeQueries({ queryKey: ['admin'] });
  }, [queryClient]);

  const login = useCallback(async (username, password) => {
    const { token } = await adminFetch('/api/admin/login', { method: 'POST', body: { username, password } });
    setToken(token);
    setSignedIn(true);
  }, []);

  useEffect(() => {
    window.addEventListener('admin-unauthorized', logout);
    return () => window.removeEventListener('admin-unauthorized', logout);
  }, [logout]);

  const value = useMemo(() => ({ signedIn, login, logout }), [signedIn, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
