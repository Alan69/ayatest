export const GET_PRODUCTS = `
  query GetProducts {
    products {
      id
      title
      description
      sum
      score
      time
      subjectLimit
      productType
      dateCreated
    }
  }
`;

export const GET_PRODUCT = `
  query GetProduct($id: UUID!) {
    product(id: $id) {
      id
      title
      description
      sum
      score
      time
      subjectLimit
      productType
      dateCreated
    }
  }
`;

export const GET_TESTS = `
  query GetTests {
    tests {
      id
      title
      numberOfQuestions
      time
      score
      grade
      dateCreated
      isRequired
    }
  }
`;

export const GET_TESTS_BY_PRODUCT = `
  query GetTestsByProduct($productId: UUID!) {
    tests(productId: $productId) {
      id
      title
      numberOfQuestions
      time
      score
      grade
      dateCreated
      isRequired
    }
  }
`;

export const GET_TEST = `
  query GetTest($id: UUID!) {
    test(id: $id) {
      id
      title
      numberOfQuestions
      time
      score
      grade
      dateCreated
      isRequired
    }
  }
`;

export const GET_QUESTIONS = `
  query GetQuestions($testId: UUID!) {
    questions(testId: $testId) {
      id
      text
      text2
      text3
      imgPath
      taskType
      level
      status
      category
      subcategory
      theme
      subtheme
      target
      source
      options {
        id
        text
        imgPath
        isCorrect
      }
    }
  }
`;

export const GET_COMPLETED_TESTS = `
  query GetCompletedTests($userId: UUID!) {
    completedTests(userId: $userId) {
      id
      completedDate
      startTestTime
      timeSpent
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

export const GET_COMPLETED_TEST = `
  query GetCompletedTest($id: UUID!) {
    completedTest(id: $id) {
      id
      completedDate
      startTestTime
      timeSpent
      product {
        id
        title
      }
      tests {
        id
        title
      }
      completedQuestions {
        id
        question {
          id
          text
        }
        selectedOptions {
          id
          text
          isCorrect
        }
      }
    }
  }
`;

export const GET_USER = `
  query GetUser($id: UUID!) {
    user(id: $id) {
      id
      username
      email
    }
  }
`; 