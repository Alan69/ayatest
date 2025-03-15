import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useQuery } from 'solid-urql';
import { useAuth } from '../App';
import { GET_COMPLETED_TESTS } from '../api/queries';
import LoadingSpinner from '../components/LoadingSpinner';

function CompletedTests() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [searchTerm, setSearchTerm] = createSignal('');
  
  const [completedTestsQuery] = useQuery({
    query: GET_COMPLETED_TESTS,
    variables: { userId: auth.user.id }
  });
  
  const filteredTests = () => {
    if (!completedTestsQuery.data?.completedTests) return [];
    
    const term = searchTerm().toLowerCase();
    if (!term) return completedTestsQuery.data.completedTests;
    
    return completedTestsQuery.data.completedTests.filter(test => 
      test.product.title.toLowerCase().includes(term)
    );
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Completed Tests</h1>
        <div class="relative">
          <input
            type="text"
            placeholder="Search tests..."
            class="input pr-10"
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.target.value)}
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <Show when={!completedTestsQuery.fetching} fallback={<LoadingSpinner />}>
        <Show when={filteredTests().length > 0} fallback={
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 text-center">
              <p class="text-gray-500">You haven't completed any tests yet.</p>
              <button 
                onClick={() => navigate('/products')}
                class="mt-4 btn btn-primary"
              >
                Start Your First Test
              </button>
            </div>
          </div>
        }>
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul class="divide-y divide-gray-200">
              {filteredTests().map(test => (
                <li>
                  <a href={`/results/${test.id}`} class="block hover:bg-gray-50">
                    <div class="px-4 py-4 sm:px-6">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-primary-600 truncate">
                          {test.product.title}
                        </p>
                        <div class="ml-2 flex-shrink-0 flex">
                          <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </p>
                        </div>
                      </div>
                      <div class="mt-2 sm:flex sm:justify-between">
                        <div class="sm:flex">
                          <p class="flex items-center text-sm text-gray-500">
                            <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                            </svg>
                            {test.tests.length} tests
                          </p>
                          <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                            </svg>
                            Time spent: {test.timeSpent} minutes
                          </p>
                        </div>
                        <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                          </svg>
                          <p>
                            Completed on {formatDate(test.completedDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Show>
      </Show>
    </div>
  );
}

export default CompletedTests; 