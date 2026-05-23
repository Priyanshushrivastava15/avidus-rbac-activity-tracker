import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  // Load user profile on app start if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            // Token invalid or user inactive
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (err) {
          console.error('Failed to load user session', err);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Standard API request wrapper
  const request = async (endpoint, options = {}) => {
    setError(null);
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // If inactive or unauthorized block triggers, clear session
        if (response.status === 401 || response.status === 403) {
          if (data.message && data.message.includes('inactive')) {
            logout();
          }
        }
        throw new Error(data.message || 'Server request failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register User
  const register = async (name, email, password, role) => {
    setError(null);
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status
        });
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login User
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status
        });
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    request
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
