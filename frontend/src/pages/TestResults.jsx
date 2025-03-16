import { createSignal, createEffect, Show, For } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { createQuery } from '@urql/solid';
import { GET_COMPLETED_TEST } from '../api/queries';
import LoadingSpinner from '../components/LoadingSpinner';

function TestResults() {
  const params = useParams();
  const navigate = useNavigate();
  
  const [stats, setStats] = createSignal({
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    score: 0,
    timeSpent: 0
  });
  
  const [testResults, testResultsState] = createQuery({
    query: GET_COMPLETED_TEST,
    variables: { id: params.testId },
  });
  
  createEffect(() => {
    if (testResults.data?.completedTest) {
      const completedTest = testResults.data.completedTest;
      const completedQuestions = completedTest.completedQuestions || [];
      
      const totalQuestions = completedQuestions.length;
      let correctAnswers = 0;
      
      completedQuestions.forEach(cq => {
        const allCorrect = cq.selectedOptions.every(option => option.isCorrect);
        const allSelected = cq.selectedOptions.length === cq.question.options?.filter(o => o.isCorrect).length;
        
        if (allCorrect && allSelected) {
          correctAnswers++;
        }
      });
      
      const incorrectAnswers = totalQuestions - correctAnswers;
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      setStats({
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        score,
        timeSpent: completedTest.timeSpent || 0
      });
    }
  });
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  return (
    <div class="space-y-6">
      <Show when={!testResults.fetching} fallback={<LoadingSpinner />}>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">
            Test Results
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            class="btn btn-outline"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {testResults.data?.completedTest?.product?.title}
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Completed on {formatDate(testResults.data?.completedTest?.completedDate)}
            </p>
          </div>
          
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Score</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span class={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                    stats().score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stats().score}%
                  </span>
                </dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Total Questions</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{stats().totalQuestions}</dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Correct Answers</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{stats().correctAnswers}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Incorrect Answers</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{stats().incorrectAnswers}</dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Time Spent</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{stats().timeSpent} minutes</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Tests Included</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul class="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {testResults.data?.completedTest?.tests.map(test => (
                      <li class="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div class="w-0 flex-1 flex items-center">
                          <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                          </svg>
                          <span class="ml-2 flex-1 w-0 truncate">
                            {test.title}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Question Summary
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Review your answers
            </p>
          </div>
          <div class="border-t border-gray-200">
            <ul class="divide-y divide-gray-200">
              {testResults.data?.completedTest?.completedQuestions.map((cq, index) => {
                const allCorrect = cq.selectedOptions.every(option => option.isCorrect);
                const allSelected = cq.selectedOptions.length === cq.question.options?.filter(o => o.isCorrect).length;
                const isCorrect = allCorrect && allSelected;
                
                return (
                  <li class="px-4 py-4 sm:px-6">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <span class={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isCorrect ? (
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                          ) : (
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                          )}
                        </span>
                        <span class="ml-3 font-medium text-gray-900">
                          Question {index + 1}: {cq.question.text}
                        </span>
                      </div>
                    </div>
                    <div class="mt-2 text-sm text-gray-500">
                      <p class="font-medium">Your answer:</p>
                      <ul class="mt-1 ml-6 list-disc">
                        {cq.selectedOptions.map(option => (
                          <li class={option.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {option.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default TestResults; 