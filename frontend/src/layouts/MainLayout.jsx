import { Outlet } from '@solidjs/router';
import { Suspense } from 'solid-js';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';

function MainLayout() {
  return (
    <div class="min-h-screen bg-gray-50">
      <Navbar />
      <div class="flex">
        <Sidebar />
        <main class="flex-1 p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default MainLayout; 