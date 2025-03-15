import { createSignal, createEffect, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useQuery } from 'solid-urql';
import { useAuth, useTest } from '../App';
import { GET_PRODUCT, GET_TESTS_BY_PRODUCT } from '../api/queries';
import LoadingSpinner from '../components/LoadingSpinner';

function TestSelection() {
  const params = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const test = useTest();
  
  const [error, setError] = createSignal('');
  const [isStarting, setIsStarting] = createSignal(false);
  
  const [productQuery] = useQuery({
    query: GET_PRODUCT,
    variables: { id: params.productId }
  });
  
  const [testsQuery] = useQuery({
    query: GET_TESTS_BY_PRODUCT,
    variables: { productId: params.productId }
  });
  
  // Reset selected tests when component mounts
  createEffect(() => {
    test.selectedTests([]);
  });
  
  const handleTestSelection = (testId, isSelected) => {
    test.selectTest(testId, isSelected);
    setError('');
  };
  
  const isTestSelected = (testId) => {
    return test.selectedTests().includes(testId);
  };
  
  const handleStartTest = async () => {
    const selectedCount = test.selectedTests().length;
    
    if (selectedCount < 3) {
      setError('Please select at least 3 tests');
      return;
    }
    
    if (selectedCount > 6) {
      setError('You can select at most 6 tests');
      return;
    }
    
    setIsStarting(true);
    setError('');
    
    const result = await test.startTest(
      auth.user.id,
      params.productId,
      test.selectedTests()
    );
    
    setIsStarting(false);
    
    if (!result.success) {
      setError(result.error || 'Failed to start test');
    }
  };
  
  return (
    <div class="space-y-6">
      <Show when={!productQuery.fetching && !testsQuery.fetching} fallback={<LoadingSpinner />}>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">
            Select Tests for {productQuery.data?.product?.title}
          </h1>
          <button
            onClick={() => navigate('/products')}
            class="btn btn-outline"
          >
            Back to Products
          </button>
        </div>
        
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Product Information
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              {productQuery.data?.product?.description}
            </p>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Time</dt>
                <dd class="mt-1 text-sm text-gray-900">{productQuery.data?.product?.time} minutes</dd>
              </div>
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Score</dt>
                <dd class="mt-1 text-sm text-gray-900">{productQuery.data?.product?.score} points</dd>
              </div>
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Test Limit</dt>
                <dd class="mt-1 text-sm text-gray-900">Select 3-6 tests (max {productQuery.data?.product?.subjectLimit})</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <Show when={error()}>
          <div class="rounded-md bg-red-50 p-4">
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
        
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Available Tests
            </h3>
            <div class="text-sm text-gray-500">
              Selected: {test.selectedTests().length} / {productQuery.data?.product?.subjectLimit || 6}
            </div>
          </div>
          <ul class="divide-y divide-gray-200">
            {testsQuery.data?.tests?.map(test => (
              <li class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <input
                      id={`test-${test.id}`}
                      name={`test-${test.id}`}
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={isTestSelected(test.id)}
                      onChange={(e) => handleTestSelection(test.id, e.target.checked)}
                    />
                    <label for={`test-${test.id}`} class="ml-3 block text-sm font-medium text-gray-700">
                      {test.title}
                    </label>
                  </div>
                  <div class="flex space-x-4 text-sm text-gray-500">
                    <div class="flex items-center">
                      <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                      </svg>
                      <span class="ml-1">{test.numberOfQuestions} questions</span>
                    </div>
                    <div class="flex items-center">
                      <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                      <span class="ml-1">{test.time} minutes</span>
                    </div>
                    <div class="flex items-center">
                      <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span class="ml-1">{test.score} points</span>
                    </div>
                    {test.isRequired && (
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div class="flex justify-end">
          <button
            onClick={handleStartTest}
            disabled={isStarting() || test.selectedTests().length < 3}
            class="btn btn-primary"
          >
            {isStarting() ? 'Starting...' : 'Start Test'}
          </button>
        </div>
      </Show>
    </div>
  );
}

export default TestSelection; 