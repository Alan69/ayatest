import { Outlet } from '@solidjs/router';
import { Suspense } from 'solid-js';
import LoadingSpinner from '../components/LoadingSpinner';

function AuthLayout() {
  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold text-primary-600">AyaTest</h1>
            </div>
            <nav class="flex space-x-4">
              <a href="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </a>
              <a href="/login" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </a>
              <a href="/register" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Register
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main class="flex-1">
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      
      <footer class="bg-white">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p class="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AyaTest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout; 