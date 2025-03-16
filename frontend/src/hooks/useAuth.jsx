import { createSignal, createEffect, createContext, useContext } from 'solid-js';
import { jwtDecode } from 'jwt-decode';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = (props) => {
  const [user, setUser] = createSignal(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [loading, setLoading] = createSignal(true);

  // Check for token on initial load
  createEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the token
        const decoded = jwtDecode(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token is expired
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Token is valid
          setUser({
            id: decoded.sub,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  });

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const token = data.token;

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Decode token and set user
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.sub,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      });
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const authValue = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={authValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 