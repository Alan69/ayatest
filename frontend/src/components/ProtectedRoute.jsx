import { Navigate, Outlet } from '@solidjs/router';
import { useAuth } from '../App';

function ProtectedRoute() {
  const auth = useAuth();
  
  return auth.isAuthenticated() ? <Outlet /> : <Navigate href="/login" />;
}

export default ProtectedRoute; 