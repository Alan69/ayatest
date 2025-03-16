import { Navigate, Outlet } from '@solidjs/router';
import { useAuth } from '../hooks/useAuth';
import { Show } from 'solid-js';

function AdminRoute() {
  const auth = useAuth();
  
  return (
    <Show 
      when={!auth.loading()} 
      fallback={<div class="flex justify-center items-center h-screen">Loading...</div>}
    >
      <Show 
        when={auth.isAuthenticated() && auth.user()?.role === 'ADMIN'} 
        fallback={<Navigate href="/login" />}
      >
        <Outlet />
      </Show>
    </Show>
  );
}

export default AdminRoute; 