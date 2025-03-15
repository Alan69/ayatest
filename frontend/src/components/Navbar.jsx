import { createSignal } from 'solid-js';
import { useAuth } from '../App';

function Navbar() {
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  
  return (
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold text-primary-600">AyaTest</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="/dashboard"
                class="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="/products"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Products
              </a>
              <a
                href="/completed-tests"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Completed Tests
              </a>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div class="ml-3 relative">
              <div>
                <button
                  type="button"
                  class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  id="user-menu-button"
                  aria-expanded={isMenuOpen()}
                  aria-haspopup="true"
                  onClick={toggleMenu}
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-semibold">
                    {auth.user.username ? auth.user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>
              </div>
              
              {isMenuOpen() && (
                <div
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabindex="-1"
                >
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    <p class="font-medium">{auth.user.username}</p>
                    <p class="text-gray-500">{auth.user.email}</p>
                  </div>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabindex="-1"
                    id="user-menu-item-0"
                  >
                    Your Profile
                  </a>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabindex="-1"
                    id="user-menu-item-1"
                  >
                    Settings
                  </a>
                  <button
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabindex="-1"
                    id="user-menu-item-2"
                    onClick={() => auth.logout()}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
          <div class="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen() && (
        <div class="sm:hidden" id="mobile-menu">
          <div class="pt-2 pb-3 space-y-1">
            <a
              href="/dashboard"
              class="bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Dashboard
            </a>
            <a
              href="/products"
              class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Products
            </a>
            <a
              href="/completed-tests"
              class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Completed Tests
            </a>
          </div>
          <div class="pt-4 pb-3 border-t border-gray-200">
            <div class="flex items-center px-4">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-semibold">
                  {auth.user.username ? auth.user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div class="ml-3">
                <div class="text-base font-medium text-gray-800">{auth.user.username}</div>
                <div class="text-sm font-medium text-gray-500">{auth.user.email}</div>
              </div>
            </div>
            <div class="mt-3 space-y-1">
              <a
                href="#"
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Your Profile
              </a>
              <a
                href="#"
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Settings
              </a>
              <button
                class="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => auth.logout()}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 