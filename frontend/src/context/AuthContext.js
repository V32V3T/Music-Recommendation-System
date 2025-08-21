import React, { createContext, useState, useEffect, useCallback } from 'react';

import { API_AUTH_URL } from './config';

const API_BASE_URL = API_AUTH_URL; // Backend API for auth

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true); // To check initial auth status

  const storeToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const removeToken = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const fetchUserDetails = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token might be invalid or expired
        removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user details', error);
      removeToken(); // Clear token on error
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to check for existing token and fetch user details on initial load
  useEffect(() => {
    fetchUserDetails(token);
  }, [token, fetchUserDetails]);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI OAuth2PasswordRequestForm expects 'username'
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (response.ok) {
      const data = await response.json();
      storeToken(data.access_token);
      await fetchUserDetails(data.access_token); // Fetch user details after login
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }
  };

  const signup = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Signup failed');
    }
    // Optionally return data or handle as needed
    // return await response.json(); 
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, isLoading, fetchUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
}; 