import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createMutation, createQuery } from '@urql/solid';
import { START_TEST, ANSWER_QUESTION, COMPLETE_TEST } from '../api/mutations';
import { GET_QUESTIONS } from '../api/queries';
import { useNavigate } from '@solidjs/router';

export const createTestStore = () => {
  const navigate = useNavigate();
  const [startTestResult, startTestMutate] = createMutation(START_TEST);
  const [answerQuestionResult, answerQuestionMutate] = createMutation(ANSWER_QUESTION);
  const [completeTestResult, completeTestMutate] = createMutation(COMPLETE_TEST);
  
  const [activeTest, setActiveTest] = createStore({
    id: null,
    productId: null,
    testIds: [],
    startTime: null,
    currentTestIndex: 0,
    currentQuestionIndex: 0,
    timeRemaining: 0,
    isCompleted: false,
  });
  
  const [selectedTests, setSelectedTests] = createSignal([]);
  const [answers, setAnswers] = createStore({});
  
  const selectTest = (testId, isSelected) => {
    if (isSelected) {
      setSelectedTests([...selectedTests(), testId]);
    } else {
      setSelectedTests(selectedTests().filter(id => id !== testId));
    }
  };
  
  const startTest = async (userId, productId, testIds) => {
    try {
      const result = await startTestMutate({
        input: {
          userId,
          productId,
          testIds,
        }
      });
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      
      const completedTest = result.data.startTest;
      
      setActiveTest({
        id: completedTest.id,
        productId,
        testIds,
        startTime: new Date(),
        currentTestIndex: 0,
        currentQuestionIndex: 0,
        timeRemaining: calculateTotalTime(testIds),
        isCompleted: false,
      });
      
      navigate(`/test/${completedTest.id}`);
      
      return { success: true, testId: completedTest.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  const calculateTotalTime = (testIds) => {
    // This would normally fetch the tests and calculate the total time
    // For now, we'll use a default of 45 minutes per test
    return testIds.length * 45 * 60; // 45 minutes in seconds per test
  };
  
  const answerQuestion = async (testId, questionId, selectedOptionIds) => {
    try {
      // Store the answer locally
      setAnswers({
        ...answers,
        [`${testId}-${questionId}`]: selectedOptionIds
      });
      
      // Send the answer to the server
      const result = await answerQuestionMutate({
        input: {
          completedTestId: activeTest.id,
          testId,
          questionId,
          selectedOptionIds,
        }
      });
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  const nextQuestion = () => {
    const currentTest = activeTest.testIds[activeTest.currentTestIndex];
    const [questionsResult] = createQuery({
      query: GET_QUESTIONS,
      variables: { testId: currentTest }
    });
    
    const questions = questionsResult.data?.questions || [];
    
    if (activeTest.currentQuestionIndex < questions.length - 1) {
      // Move to the next question in the current test
      setActiveTest({
        ...activeTest,
        currentQuestionIndex: activeTest.currentQuestionIndex + 1
      });
    } else if (activeTest.currentTestIndex < activeTest.testIds.length - 1) {
      // Move to the first question of the next test
      setActiveTest({
        ...activeTest,
        currentTestIndex: activeTest.currentTestIndex + 1,
        currentQuestionIndex: 0
      });
    } else {
      // All questions have been answered
      completeTest();
    }
  };
  
  const previousQuestion = () => {
    if (activeTest.currentQuestionIndex > 0) {
      // Move to the previous question in the current test
      setActiveTest({
        ...activeTest,
        currentQuestionIndex: activeTest.currentQuestionIndex - 1
      });
    } else if (activeTest.currentTestIndex > 0) {
      // Move to the last question of the previous test
      const previousTestId = activeTest.testIds[activeTest.currentTestIndex - 1];
      const [questionsResult] = createQuery({
        query: GET_QUESTIONS,
        variables: { testId: previousTestId }
      });
      
      const questions = questionsResult.data?.questions || [];
      
      setActiveTest({
        ...activeTest,
        currentTestIndex: activeTest.currentTestIndex - 1,
        currentQuestionIndex: questions.length - 1
      });
    }
  };
  
  const completeTest = async () => {
    try {
      const timeSpent = Math.floor((new Date() - new Date(activeTest.startTime)) / 1000 / 60); // in minutes
      
      const result = await completeTestMutate({
        input: {
          completedTestId: activeTest.id,
          timeSpent,
        }
      });
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      
      setActiveTest({
        ...activeTest,
        isCompleted: true
      });
      
      navigate(`/results/${activeTest.id}`);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  const resetTest = () => {
    setActiveTest({
      id: null,
      productId: null,
      testIds: [],
      startTime: null,
      currentTestIndex: 0,
      currentQuestionIndex: 0,
      timeRemaining: 0,
      isCompleted: false,
    });
    
    setAnswers({});
  };
  
  return {
    activeTest,
    selectedTests,
    answers,
    selectTest,
    startTest,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    completeTest,
    resetTest,
  };
}; 