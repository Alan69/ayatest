import { lazy, createContext, useContext } from 'solid-js';
import { Routes, Route, Navigate } from '@solidjs/router';
import { AuthProvider } from './hooks/useAuth';
import { createTestStore } from './store/test';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

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
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Create test context
export const TestContext = createContext();

// Custom hook to use the test context
export const useTest = () => useContext(TestContext);

function App() {
  const test = createTestStore();

  return (
    <AuthProvider>
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
          
          {/* Admin routes */}
          <Route path="/admin" component={AdminRoute}>
            <Route path="/" component={AdminPage} />
          </Route>
          
          {/* Fallback routes */}
          <Route path="/404" component={NotFound} />
          <Route path="*" element={<Navigate href="/404" />} />
        </Routes>
      </TestContext.Provider>
    </AuthProvider>
  );
}

export default App; 