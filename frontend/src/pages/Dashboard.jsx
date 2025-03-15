import { createSignal, createEffect, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useQuery } from 'solid-urql';
import { useAuth } from '../App';
import { GET_COMPLETED_TESTS } from '../api/queries';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = createSignal({
    totalTests: 0,
    averageScore: 0,
    testsThisMonth: 0
  });

  const [completedTestsQuery] = useQuery({
    query: GET_COMPLETED_TESTS,
    variables: { userId: auth.user.id },
  });

  createEffect(() => {
    if (completedTestsQuery.data) {
      const tests = completedTestsQuery.data.completedTests || [];
      
      // Calculate stats
      const totalTests = tests.length;
      
      // For this example, we'll just set some placeholder stats
      // In a real app, you would calculate these from the actual test data
      setStats({
        totalTests,
        averageScore: totalTests > 0 ? Math.floor(Math.random() * 40) + 60 : 0, // Random score between 60-100
        testsThisMonth: Math.min(totalTests, Math.floor(Math.random() * 5) + 1) // Random recent tests
      });
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const goToProducts = () => {
    navigate('/products');
  };

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button 
          onClick={goToProducts}
          class="btn btn-primary"
        >
          Start New Test
        </button>
      </div>

      {/* Stats Cards */}
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Total Tests Completed
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {stats().totalTests}
              </dd>
            </dl>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Average Score
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {stats().averageScore}%
              </dd>
            </dl>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Tests This Month
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {stats().testsThisMonth}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Recent Tests */}
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Recent Tests
          </h3>
        </div>
        
        <Show when={!completedTestsQuery.fetching} fallback={<LoadingSpinner />}>
          <Show 
            when={completedTestsQuery.data?.completedTests?.length > 0} 
            fallback={
              <div class="px-4 py-5 text-center text-gray-500">
                <p>You haven't completed any tests yet.</p>
                <button 
                  onClick={goToProducts}
                  class="mt-4 btn btn-primary"
                >
                  Start Your First Test
                </button>
              </div>
            }
          >
            <ul class="divide-y divide-gray-200">
              {completedTestsQuery.data?.completedTests?.slice(0, 5).map((test) => (
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
                            {test.tests.length} tests
                          </p>
                          <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Time spent: {test.timeSpent} minutes
                          </p>
                        </div>
                        <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
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
            
            <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <a 
                href="/completed-tests" 
                class="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all completed tests
              </a>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default Dashboard; 