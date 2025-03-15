import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useQuery } from 'solid-urql';
import { useAuth, useTest } from '../App';
import { GET_QUESTIONS, GET_TEST } from '../api/queries';
import LoadingSpinner from '../components/LoadingSpinner';

function TestTaking() {
  const params = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const test = useTest();
  
  const [currentQuestion, setCurrentQuestion] = createSignal(null);
  const [selectedOptions, setSelectedOptions] = createSignal([]);
  const [timeRemaining, setTimeRemaining] = createSignal(0);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal('');
  
  // Get the current test
  const currentTestId = () => {
    return test.activeTest.testIds[test.activeTest.currentTestIndex];
  };
  
  // Query for the current test details
  const [testQuery] = useQuery({
    query: GET_TEST,
    variables: { id: currentTestId() },
    pause: !currentTestId()
  });
  
  // Query for questions in the current test
  const [questionsQuery] = useQuery({
    query: GET_QUESTIONS,
    variables: { testId: currentTestId() },
    pause: !currentTestId()
  });
  
  // Set up timer
  createEffect(() => {
    if (test.activeTest.timeRemaining > 0) {
      setTimeRemaining(test.activeTest.timeRemaining);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      onCleanup(() => clearInterval(timer));
    }
  });
  
  // Update current question when questions are loaded or navigation happens
  createEffect(() => {
    if (questionsQuery.data?.questions) {
      const questions = questionsQuery.data.questions;
      if (questions.length > 0 && test.activeTest.currentQuestionIndex < questions.length) {
        setCurrentQuestion(questions[test.activeTest.currentQuestionIndex]);
        
        // Load previously selected options if any
        const questionId = questions[test.activeTest.currentQuestionIndex].id;
        const testId = currentTestId();
        const answerKey = `${testId}-${questionId}`;
        
        if (test.answers[answerKey]) {
          setSelectedOptions(test.answers[answerKey]);
        } else {
          setSelectedOptions([]);
        }
      }
    }
  });
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleOptionSelect = (optionId) => {
    let newSelectedOptions;
    
    if (selectedOptions().includes(optionId)) {
      newSelectedOptions = selectedOptions().filter(id => id !== optionId);
    } else {
      newSelectedOptions = [...selectedOptions(), optionId];
    }
    
    setSelectedOptions(newSelectedOptions);
  };
  
  const handleSaveAnswer = async () => {
    if (!currentQuestion()) return;
    
    setIsSubmitting(true);
    setError('');
    
    const result = await test.answerQuestion(
      currentTestId(),
      currentQuestion().id,
      selectedOptions()
    );
    
    setIsSubmitting(false);
    
    if (!result.success) {
      setError(result.error || 'Failed to save answer');
    }
  };
  
  const handleNext = async () => {
    await handleSaveAnswer();
    test.nextQuestion();
  };
  
  const handlePrevious = () => {
    test.previousQuestion();
  };
  
  const handleFinish = async () => {
    await handleSaveAnswer();
    
    setIsSubmitting(true);
    setError('');
    
    const result = await test.completeTest();
    
    setIsSubmitting(false);
    
    if (!result.success) {
      setError(result.error || 'Failed to complete test');
    }
  };
  
  const handleTimeUp = async () => {
    setError('Time is up! Your test will be submitted automatically.');
    await test.completeTest();
  };
  
  const isLastQuestion = () => {
    if (!questionsQuery.data?.questions) return false;
    
    const isLastQuestionInTest = test.activeTest.currentQuestionIndex === questionsQuery.data.questions.length - 1;
    const isLastTest = test.activeTest.currentTestIndex === test.activeTest.testIds.length - 1;
    
    return isLastQuestionInTest && isLastTest;
  };
  
  const isFirstQuestion = () => {
    return test.activeTest.currentQuestionIndex === 0 && test.activeTest.currentTestIndex === 0;
  };
  
  const getQuestionNumber = () => {
    let questionNumber = test.activeTest.currentQuestionIndex + 1;
    
    // Add questions from previous tests
    for (let i = 0; i < test.activeTest.currentTestIndex; i++) {
      const testId = test.activeTest.testIds[i];
      // This is simplified - in a real app you'd need to get the question count for each test
      questionNumber += 15; // Assuming each test has 15 questions
    }
    
    return questionNumber;
  };
  
  const getTotalQuestions = () => {
    // Simplified - in a real app you'd need to get the actual total
    return test.activeTest.testIds.length * 15; // Assuming each test has 15 questions
  };
  
  return (
    <div class="space-y-6">
      <Show when={!questionsQuery.fetching && currentQuestion()} fallback={<LoadingSpinner />}>
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {testQuery.data?.test?.title}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Question {getQuestionNumber()} of {getTotalQuestions()}
              </p>
            </div>
            <div class="flex items-center">
              <div class={`text-lg font-medium ${timeRemaining() < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                <svg class="inline-block h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                {formatTime(timeRemaining())}
              </div>
            </div>
          </div>
          
          <Show when={error()}>
            <div class="px-4 py-3 bg-red-50 text-red-800 text-sm">
              {error()}
            </div>
          </Show>
          
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div class="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion().text}
            </div>
            
            {currentQuestion().text2 && (
              <div class="text-base text-gray-700 mb-4">
                {currentQuestion().text2}
              </div>
            )}
            
            {currentQuestion().text3 && (
              <div class="text-base text-gray-700 mb-4">
                {currentQuestion().text3}
              </div>
            )}
            
            {currentQuestion().imgPath && (
              <div class="mb-6">
                <img 
                  src={currentQuestion().imgPath} 
                  alt="Question image" 
                  class="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            
            <div class="mt-6 space-y-4">
              {currentQuestion().options.map(option => (
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id={`option-${option.id}`}
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={selectedOptions().includes(option.id)}
                      onChange={() => handleOptionSelect(option.id)}
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label for={`option-${option.id}`} class="font-medium text-gray-700">
                      {option.text}
                    </label>
                    {option.imgPath && (
                      <div class="mt-2">
                        <img 
                          src={option.imgPath} 
                          alt="Option image" 
                          class="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion() || isSubmitting()}
              class="btn btn-outline"
            >
              Previous
            </button>
            
            <div>
              {isLastQuestion() ? (
                <button
                  onClick={handleFinish}
                  disabled={isSubmitting()}
                  class="btn btn-primary"
                >
                  {isSubmitting() ? 'Submitting...' : 'Finish Test'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting()}
                  class="btn btn-primary"
                >
                  {isSubmitting() ? 'Saving...' : 'Next Question'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default TestTaking; 