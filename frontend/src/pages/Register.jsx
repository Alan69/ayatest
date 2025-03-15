import { createSignal, Show } from 'solid-js';
import { useAuth } from '../App';

function Register() {
  const auth = useAuth();
  
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username() || !email() || !password() || !confirmPassword()) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password() !== confirmPassword()) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const result = await auth.register(username(), email(), password());
    
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
  };
  
  return (
    <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Show when={error()}>
            <div class="rounded-md bg-red-50 p-4 mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-red-800">
                    {error()}
                  </p>
                </div>
              </div>
            </div>
          </Show>
          
          <form class="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div class="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autocomplete="username"
                  required
                  class="input"
                  value={username()}
                  onInput={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div class="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="input"
                  value={email()}
                  onInput={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div class="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="input"
                  value={password()}
                  onInput={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div class="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="input"
                  value={confirmPassword()}
                  onInput={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={isLoading()}
              >
                {isLoading() ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">
                  Or
                </span>
              </div>
            </div>

            <div class="mt-6">
              <div class="flex items-center justify-center">
                <div class="text-sm">
                  <a href="/login" class="font-medium text-primary-600 hover:text-primary-500">
                    Already have an account? Sign in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register; 