# Quiz App API

This is the API for the Quiz App. It provides the backend functionality for managing quizzes.

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:mateuszpolis/quiz-app-api.git
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```env
   DB_HOST
   DB_PORT
   DB_USERNAME
   DB_PASSWORD
   DB_DATABASE
   ```

   and specify the 'type' of the database you are using in the app.module.ts file.

   ```typescript
    TypeOrmModule.forRoot({
      type: 'posgresql', // specify the type of database you are using, don't change the other values
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [],
      synchronize: true,
    }),
   ```

4. Start the server:

   ```bash
    npm run start
   ```

5. The server will start on port 3000.

   ```bash
   Server running on port 3000
   ```

6. You can now access the API at `http://localhost:3000`.

## Testing

The tests cover the functions in user and quiz resolvers and the services.
They check if the functions are working as expected as well as the error handling.

To run the tests, use the following command:

```bash
npm run test
```

## Walkthrough of the API and examples of GraphQL queries and mutations

The API has the following functionality:

- Create a user
- Delete a user
- Create a quiz
- Delete a quiz
- Get questions for a quiz
- Submit a quiz
- Get results for a quiz
- Grant access to a quiz

### Create a user

createUser(createUserInput: CreateUserInput!): CreateUserOutput!

input CreateUserInput {
username: String!
role: String!
}

type CreateUserOutput {
id: ID!
username: String!
role: String!
}

```graphql
mutation {
  createUser(
    createUserInput: {
      username: "user1"
      role: "student"
    }
  ) {
    id
    username
    role
  }
}
```

### Delete a user

removeUser(id: Float!): CreateUserOutput!

type CreateUserOutput {
id: ID!
username: String!
role: String!
}

```graphql
mutation {
  removeUser(id: 1) {
    id
    username
    role
  }
}
```

### Create a quiz

createQuiz(createQuizInput: CreateQuizInput!): ID!

input CreateQuizInput {
quiz_name: String!
author_id: ID!
is_public: Boolean! = false
users_with_access: [ID!]
description: String
questions: [QuestionInput!]!
}

input QuestionInput {
question_text: String!
question_type: QuestionType!
points: Float! = 1
answers: [AnswerInput!]!
}

input AnswerInput {
answer_text: String!
answer_response: String
is_correct: Boolean = false
order: Int
}

```graphql
mutation {
  createQuiz(
    createQuizInput: {
      author_id: 1
      is_public: true
      quiz_name: "General Knowledge Quiz"
      description: "A quiz testing your general knowledge"
      questions: [
        {
          question_text: "What is the capital of France?"
          question_type: single
          points: 1
          answers: [
            { answer_text: "London", is_correct: false }
            { answer_text: "Paris", is_correct: true }
            { answer_text: "Rome", is_correct: false }
            { answer_text: "Madrid", is_correct: false }
          ]
        }
        {
          question_text: "Which of the following programming languages are object-oriented?"
          question_type: multiple
          points: 2
          answers: [
            { answer_text: "Java", is_correct: true }
            { answer_text: "C", is_correct: false }
            { answer_text: "Python", is_correct: true }
            { answer_text: "Ruby", is_correct: true }
          ]
        }
        {
          question_text: "Arrange the following events in chronological order"
          question_type: sorting
          points: 3
          answers: [
            { answer_text: "Declaration of Independence", order: 1 }
            { answer_text: "World War II", order: 2 }
            { answer_text: "First Moon Landing", order: 3 }
          ]
        }
        {
          question_text: "What is the famous phrase from Star Wars?"
          question_type: text
          points: 1
          answers: [
            { answer_text: "", answer_response: "May the force be with you" }
          ]
        }
      ]
    }
  )
}
```

### Delete a quiz

delteQuiz(quiz_id: Float!, user_id: Float!): Boolean!

```graphql
mutation {
  deleteQuiz(quiz_id: 1, user_id: 1)
}
```

### Get questions for a quiz

getQuestionsForQuiz(quiz_id: Float!, user_id: Float!): [QuestionOuptut!]!

type QuestionOuptut {
question_id: ID!
points: Float!
question_text: String!
question_type: QuestionType!
answers: [AnswerOutput!]
}

type AnswerOutput {
answer_id: ID!
answer_text: String!
}

```graphql
query {
  getQuestionsForQuiz(quiz_id: 1, user_id: 1) {
    question_id
    points
    question_text
    question_type
    answers {
      answer_id
      answer_text
    }
  }
}
```

### Submit a quiz

submitQuiz(submitAnswersInput: SubmitQuizInput!): SubmitQuizOutput!

input SubmitQuizInput {
user_id: ID!
quiz_id: ID!
answers: [SubmitAnswerInput!]!
}

input SubmitAnswerInput {
question_id: Int!
answer_ids: [Int!]
answer_response: String
sorted_answers: [Int!]
}

type SubmitQuizOutput {
score: Float!
total: Float!
quiz_id: ID!
user_id: ID!
}

```graphql
mutation {
  submitQuiz(
    submitAnswersInput: {
      user_id: 1
      quiz_id: 1
      answers: [
        { question_id: 1, answer_ids: [2] }
        { question_id: 2, answer_ids: [5, 7, 8] }
        { question_id: 3, sorted_answers: [9, 10, 11] }
        { question_id: 4, answer_response: "May the force be with you" }
      ]
    }
  ) {
    score
    total
    quiz_id
    user_id
  }
}
```

### Get results for a quiz

#### Get results for a quiz for as a student

getQuizResultStudent(quiz_id: Float!, user_id: Float!): QuizResultsOutput!

type QuizResultsOutput {
score: Float!
total: Float!
user: User!
user_answers: [UserAnswer!]
}

type UserAnswer {
user_answer_id: ID!
user: User!
quiz: Quiz!
question: Question!
answer_ids: [ID!]
answer_response: String
sorted_answers: [ID!]
score: Float!
}

```graphql
query {
  getQuizResultStudent(quiz_id: 1, user_id: 1) {
    score
    total
    user {
      username
      role
    }
    user_answers {
      user_answer_id
      answer_response
      score
      question {
        question_text
      }
      
    }
  }
}
```

#### Get results for a quiz for as a teacher

getQuizResultsTeacher(quiz_id: Float!, user_id: Float!): [QuizResultsOutput!]!

```graphql
query {
  getQuizResultsTeacher(quiz_id: 1, user_id: 1) {
    score
    total
    user {
      username
      role
    }
    user_answers {
      user_answer_id
      answer_response
      sorted_answers
      answer_ids
      score
      question {
        question_text
      }
    }
  }
}
```

### Grant access to a quiz

grantAcces(quiz_id: Float!, user_id: Float!, teacher_id: Float!): Boolean!

```graphql
mutation {
  grantAcces(quiz_id: 1, user_id: 1, teacher_id: 1)
}
```
