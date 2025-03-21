import { Navigate, Outlet } from '@solidjs/router';
import { useAuth } from '../hooks/useAuth';
import { Show } from 'solid-js';

function ProtectedRoute() {
  const auth = useAuth();
  
  return (
    <Show 
      when={!auth.loading()} 
      fallback={<div class="flex justify-center items-center h-screen">Loading...</div>}
    >
      <Show 
        when={auth.isAuthenticated()} 
        fallback={<Navigate href="/login" />}
      >
        <Outlet />
      </Show>
    </Show>
  );
}

export default ProtectedRoute; 