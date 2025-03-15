export const LOGIN = `
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

export const CREATE_USER = `
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      username
      email
    }
  }
`;

export const START_TEST = `
  mutation StartTest($input: StartTestInput!) {
    startTest(input: $input) {
      id
      startTestTime
      product {
        id
        title
      }
      tests {
        id
        title
      }
    }
  }
`;

export const ANSWER_QUESTION = `
  mutation AnswerQuestion($input: AnswerQuestionInput!) {
    answerQuestion(input: $input) {
      id
      completedTest {
        id
      }
      test {
        id
      }
      question {
        id
      }
      selectedOptions {
        id
        text
      }
    }
  }
`;

export const COMPLETE_TEST = `
  mutation CompleteTest($input: CompleteTestInput!) {
    completeTest(input: $input) {
      id
      completedDate
      timeSpent
    }
  }
`; 