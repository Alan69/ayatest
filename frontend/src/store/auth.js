import { createSignal, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { jwtDecode } from 'jwt-decode';
import { createMutation } from '@urql/solid';
import { LOGIN, CREATE_USER } from '../api/mutations';
import { useNavigate } from '@solidjs/router';

export const createAuthStore = () => {
  const navigate = useNavigate();
  const [loginResult, loginMutate] = createMutation(LOGIN);
  const [registerResult, registerMutate] = createMutation(CREATE_USER);
  
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [user, setUser] = createStore({
    id: null,
    username: null,
    email: null,
  });
  
  // Check if user is already authenticated on mount
  createEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiresAt = decoded.exp * 1000;
        
        if (Date.now() < expiresAt) {
          setUser({
            id: decoded.sub,
            username: decoded.username,
            email: decoded.email,
          });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (e) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
  });
  
  const login = async (username, password) => {
    try {
      const result = await loginMutate({ username, password });
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      
      const token = result.data.login;
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.sub,
        username: decoded.username,
        email: decoded.email,
      });
      
      setIsAuthenticated(true);
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  const register = async (username, email, password) => {
    try {
      const result = await registerMutate({
        input: { username, email, password }
      });
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      
      navigate('/login', { state: { registered: true } });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser({
      id: null,
      username: null,
      email: null,
    });
    navigate('/login');
  };
  
  return {
    isAuthenticated,
    user,
    login,
    register,
    logout,
  };
}; 