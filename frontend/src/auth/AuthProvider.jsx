import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './context';
import strapiClient from '../api/strapi';

const TOKEN_KEY = 'comunidad_token';
const USER_KEY = 'comunidad_user';

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await strapiClient.get('/users/me');
        if (active) {
          setUser(data);
          localStorage.setItem(USER_KEY, JSON.stringify(data));
        }
      } catch {
        if (active) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const persistSession = useCallback((jwt, userData) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
  }, []);

  const login = useCallback(
    async (identifier, password) => {
      const { data } = await strapiClient.post('/auth/local', {
        identifier,
        password,
      });
      persistSession(data.jwt, data.user);
      return data.user;
    },
    [persistSession],
  );

  const register = useCallback(
    async (username, email, password) => {
      const { data } = await strapiClient.post('/auth/local/register', {
        username,
        email,
        password,
      });
      persistSession(data.jwt, data.user);
      return data.user;
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser((current) => {
      const updated = nextUser ?? current;
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await strapiClient.get('/users/me');
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}