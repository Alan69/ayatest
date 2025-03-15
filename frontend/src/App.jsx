import { lazy, createContext, useContext } from 'solid-js';
import { Routes, Route, Navigate } from '@solidjs/router';
import { createAuthStore } from './store/auth';
import { createTestStore } from './store/test';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const TestSelection = lazy(() => import('./pages/TestSelection'));
const TestTaking = lazy(() => import('./pages/TestTaking'));
const TestResults = lazy(() => import('./pages/TestResults'));
const CompletedTests = lazy(() => import('./pages/CompletedTests'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Create contexts
export const AuthContext = createContext();
export const TestContext = createContext();

// Custom hooks to use the contexts
export const useAuth = () => useContext(AuthContext);
export const useTest = () => useContext(TestContext);

function App() {
  const auth = createAuthStore();
  const test = createTestStore();

  return (
    <AuthContext.Provider value={auth}>
      <TestContext.Provider value={test}>
        <Routes>
          {/* Public routes */}
          <Route path="/" component={AuthLayout}>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
          </Route>
          
          {/* Protected routes */}
          <Route path="/" component={ProtectedRoute}>
            <Route path="/" component={MainLayout}>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/products" component={Products} />
              <Route path="/products/:id" component={ProductDetail} />
              <Route path="/test-selection/:productId" component={TestSelection} />
              <Route path="/test/:id" component={TestTaking} />
              <Route path="/results/:id" component={TestResults} />
              <Route path="/completed-tests" component={CompletedTests} />
            </Route>
          </Route>
          
          {/* Fallback routes */}
          <Route path="/404" component={NotFound} />
          <Route path="*" element={<Navigate href="/404" />} />
        </Routes>
      </TestContext.Provider>
    </AuthContext.Provider>
  );
}

export default App; 