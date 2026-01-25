import { useState, createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  
  useEffect(() => {
    setLoading(true);

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
        } else {
          setToken(storedToken);
          setUser({
            id: decoded.user.id,
            role: decoded.user.role,
            email: decoded.user.email,
          });
        }

      } catch (err) {
        console.error('Token decoding failed:', err);
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, []);

  
  const login = (newToken) => {
    try {
      localStorage.setItem('token', newToken);
      const decoded = jwtDecode(newToken);

      setUser({
        id: decoded.user.id,
        role: decoded.user.role,
        email: decoded.user.email,
      });

      setToken(newToken);

      
      if (decoded.user.role === 'Organizer') {
        router.push('/organiser/dashboard');
      } else if (decoded.user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }

    } catch (err) {
      console.error('Token decode failed:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    router.push('/select-login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
