import { Test, TestingModule } from '@nestjs/testing';
import { CreateQuizInput } from '../dto/create-quiz.input';
import { QuizResolver } from '../quiz.resolver';
import { QuizService } from '../quiz.service';
import { AppModule } from '../../app.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz.entity';
import { Question, QuestionType } from '../entities/question.entity';
import { UserResolver } from '../../user/user.resolver';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { Answer } from '../entities/answer.entity';
import { QuizAccess } from '../entities/quizacces.entity';
import { QuizResult } from '../entities/quiz-result.entity';
import { UserAnswer } from '../entities/user-answer.entity';
import { Repository } from 'typeorm';
import { HttpStatus } from '@nestjs/common';
import { SubmitQuizInput } from '../dto/submit-quiz.input';

describe('QuizResolver', () => {
  let quizResolver: QuizResolver;
  let userResolver: UserResolver;
  let userRepository: Repository<User>;
  let quizRepository: Repository<Quiz>;
  let quizAccessRepository: Repository<QuizAccess>;
  let quizResultRepository: Repository<QuizResult>;
  let userAnswerRepository: Repository<UserAnswer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizResolver, QuizService, UserResolver, UserService],
      imports: [
        AppModule,
        TypeOrmModule.forFeature([Quiz]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Question]),
        TypeOrmModule.forFeature([Answer]),
        TypeOrmModule.forFeature([QuizAccess]),
        TypeOrmModule.forFeature([QuizResult]),
        TypeOrmModule.forFeature([UserAnswer]),
      ],
    }).compile();

    quizResolver = module.get<QuizResolver>(QuizResolver);
    userResolver = module.get<UserResolver>(UserResolver);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    quizRepository = module.get<Repository<Quiz>>(getRepositoryToken(Quiz));
    quizAccessRepository = module.get<Repository<QuizAccess>>(
      getRepositoryToken(QuizAccess),
    );
    quizResultRepository = module.get<Repository<QuizResult>>(
      getRepositoryToken(QuizResult),
    );
    userAnswerRepository = module.get<Repository<UserAnswer>>(
      getRepositoryToken(UserAnswer),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(quizResolver).toBeDefined();
  });

  describe('createQuiz', () => {
    it('should create a new quiz', async () => {
      const user = await userResolver.createUser({
        username: (Math.random() + 1).toString(36).substring(7),
        role: 'teacher',
      });

      const createQuizInput: CreateQuizInput = {
        author_id: user.id,
        is_public: true,
        quiz_name: 'Quiz Test',
        questions: [],
      };

      const id = await quizResolver.createQuiz(createQuizInput);
      await quizResolver.deleteQuiz(id, user.id);
      await userResolver.removeUser(user.id);
      expect(id).toEqual(expect.any(Number));
    });

    it('should throw user not found error', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const createQuizInput = {
        author_id: 1,
        is_public: true,
        quiz_name: 'Quiz 1',
        questions: [
          {
            question_text: 'What is 1+1?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_text: '1', is_correct: false },
              { answer_text: '2', is_correct: true },
              { answer_text: '3', is_correct: false },
              { answer_text: '4', is_correct: false },
            ],
          },
          {
            question_text: 'What is 2+2?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_text: '1', is_correct: false },
              { answer_text: '2', is_correct: false },
              { answer_text: '3', is_correct: false },
              { answer_text: '4', is_correct: true },
            ],
          },
          {
            question_text: 'Which numbers are negative?',
            question_type: QuestionType.multiple,
            points: 4,
            answers: [
              { answer_text: '-5', is_correct: true },
              { answer_text: '6', is_correct: false },
              { answer_text: '-7', is_correct: true },
              { answer_text: '8', is_correct: false },
            ],
          },
        ],
      };

      try {
        await quizResolver.createQuiz(createQuizInput);
      } catch (e) {
        expect(e.message).toEqual('User not found');
      }
    });

    it('should throw an error when creating a quiz with an existing name', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 1,
        username: 'user1',
        role: 'teacher',
        quizzes: [],
        answers: [],
        quiz_results: [],
        access: [],
      });

      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        author: {
          user_id: 1,
          username: 'user1',
          role: 'teacher',
          quizzes: [],
          answers: [],
          access: [],
          quiz_results: [],
        },
        description: '',
        access: [],
        questions: [],
        quiz_results: [],
        answers: [],
      });

      const createQuizInput: CreateQuizInput = {
        author_id: 1,
        is_public: true,
        quiz_name: 'Quiz 1',
        questions: [
          {
            question_text: 'What is 1+1?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_text: '1', is_correct: false },
              { answer_text: '2', is_correct: true },
              { answer_text: '3', is_correct: false },
              { answer_text: '4', is_correct: false },
            ],
          },
          {
            question_text: 'What is 2+2?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_text: '1', is_correct: false },
              { answer_text: '2', is_correct: false },
              { answer_text: '3', is_correct: false },
              { answer_text: '4', is_correct: true },
            ],
          },
          {
            question_text: 'Which numbers are negative?',
            question_type: QuestionType.multiple,
            points: 4,
            answers: [
              { answer_text: '-5', is_correct: true },
              { answer_text: '6', is_correct: false },
              { answer_text: '-7', is_correct: true },
              { answer_text: '8', is_correct: false },
            ],
          },
        ],
      };

      try {
        await quizResolver.createQuiz(createQuizInput);
      } catch (e) {
        expect(e.message).toEqual('Quiz with this name already exists');
      }
    });

    it('should throw an error user is not a teacher', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 1,
        username: 'user1',
        role: 'student',
        quizzes: [],
        answers: [],
        quiz_results: [],
        access: [],
      });

      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        author: {
          user_id: 1,
          username: 'user1',
          role: 'student',
          quizzes: [],
          answers: [],
          access: [],
          quiz_results: [],
        },
        description: '',
        access: [],
        questions: [],
        quiz_results: [],
        answers: [],
      });

      const createQuizInput: CreateQuizInput = {
        author_id: 1,
        is_public: true,
        quiz_name: 'Quiz 1',
        questions: [
          {
            question_text: 'What is 1+1?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_text: '1', is_correct: false },
              { answer_text: '2', is_correct: true },
              { answer_text: '3', is_correct: false },
              { answer_text: '4', is_correct: false },
            ],
          },
          {
            question_text: 'What is 2+2?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_text: '1', is_correct: false },
              { answer_text: '2', is_correct: false },
              { answer_text: '3', is_correct: false },
              { answer_text: '4', is_correct: true },
            ],
          },
          {
            question_text: 'Which numbers are negative?',
            question_type: QuestionType.multiple,
            points: 4,
            answers: [
              { answer_text: '-5', is_correct: true },
              { answer_text: '6', is_correct: false },
              { answer_text: '-7', is_correct: true },
              { answer_text: '8', is_correct: false },
            ],
          },
        ],
      };

      try {
        await quizResolver.createQuiz(createQuizInput);
      } catch (e) {
        expect(e.message).toEqual('User is not a teacher');
      }
    });
  });

  describe('removeQuiz', () => {
    it('should remove a quiz', async () => {
      const user = await userResolver.createUser({
        username: (Math.random() + 1).toString(36).substring(7),
        role: 'teacher',
      });

      const createQuizInput: CreateQuizInput = {
        author_id: user.id,
        is_public: true,
        quiz_name: 'Quiz Test',
        questions: [],
      };
      const id = await quizResolver.createQuiz(createQuizInput);
      const result = await quizResolver.deleteQuiz(id, user.id);
      await userResolver.removeUser(user.id);

      expect(result).toBeTruthy();
    });

    it('should throw an error when removing a non-existing quiz', async () => {
      try {
        await quizResolver.deleteQuiz(999, 1);
      } catch (e) {
        expect(e.message).toEqual('Quiz not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when removing a quiz that does not belong to the user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 1,
        username: 'user1',
        role: 'teacher',
        quizzes: [],
        answers: [],
        quiz_results: [],
        access: [],
      });

      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        author: {
          user_id: 2,
          ...new User(),
        },
        ...new Quiz(),
      });

      try {
        await quizResolver.deleteQuiz(1, 2);
      } catch (e) {
        expect(e.message).toEqual('User is not the author of the quiz');
        expect(e.getStatus()).toEqual(HttpStatus.FORBIDDEN);
      }
    });
  });

  describe('getQuizQuestions', () => {
    it('should get questions for a quiz', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        questions: [],
        ...new Quiz(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        access_id: '1',
        author: {
          user_id: 1,
          username: 'user1',
          role: 'teacher',
          ...new User(),
        },
        users_with_access: [],
        is_public: true,
      });

      const result = await quizResolver.getQuestionsForQuiz(1, 2);
      expect(result).toEqual([]);
    });

    it('should throw an error when quiz is not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(null);

      try {
        await quizResolver.getQuestionsForQuiz(999, 2);
      } catch (e) {
        expect(e.message).toEqual('Quiz not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when user does not have access to the quiz', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        questions: [],
        ...new Quiz(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        access_id: '1',
        author: {
          user_id: 1,
          username: 'user1',
          role: 'teacher',
          ...new User(),
        },
        users_with_access: [],
        is_public: false,
      });

      try {
        await quizResolver.getQuestionsForQuiz(1, 2);
      } catch (e) {
        expect(e.message).toEqual('User does not have access');
        expect(e.getStatus()).toEqual(HttpStatus.FORBIDDEN);
      }
    });
  });

  describe('submitQuiz', () => {
    it('should submit a quiz', async () => {
      const teacher = await userResolver.createUser({
        username: (Math.random() + 1).toString(36).substring(7),
        role: 'teacher',
      });

      const user = await userResolver.createUser({
        username: (Math.random() + 1).toString(36).substring(7),
        role: 'student',
      });

      const createQuizInput: CreateQuizInput = {
        author_id: teacher.id,
        is_public: true,
        quiz_name: (Math.random() + 1).toString(36).substring(7),
        questions: [
          {
            question_text: 'What is 1+1?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_text: '1', is_correct: false },
              { answer_text: '2', is_correct: true },
              { answer_text: '3', is_correct: false },
              { answer_text: '4', is_correct: false },
            ],
          },
          {
            question_text: 'What is 2+2?',
            question_type: QuestionType.text,
            points: 1,
            answers: [{ answer_text: '', answer_response: '4' }],
          },
          {
            question_text: 'Which numbers are negative?',
            question_type: QuestionType.multiple,
            points: 4,
            answers: [
              { answer_text: '-5', is_correct: true },
              { answer_text: '6', is_correct: false },
              { answer_text: '-7', is_correct: true },
              { answer_text: '8', is_correct: false },
            ],
          },
          {
            question_text: 'Sort numbers in ascending order',
            question_type: QuestionType.sorting,
            points: 1,
            answers: [
              { answer_text: '1', order: 1 },
              { answer_text: '2', order: 2 },
              { answer_text: '3', order: 3 },
              { answer_text: '6', order: 4 },
            ],
          },
        ],
      };

      const quizId = await quizResolver.createQuiz(createQuizInput);

      const questions = await quizResolver.getQuestionsForQuiz(quizId, user.id);

      const submitQuizInput: SubmitQuizInput = {
        quiz_id: quizId,
        user_id: user.id,
        answers: [
          {
            question_id: questions[0].question_id,
            answer_ids: [2],
          },
          {
            question_id: questions[1].question_id,
            answer_response: '4',
          },
          {
            question_id: questions[2].question_id,
            answer_ids: [
              questions[2].answers[0].answer_id,
              questions[2].answers[2].answer_id,
            ],
          },
          {
            question_id: questions[3].question_id,
            sorted_answers: [
              questions[3].answers[0].answer_id,
              questions[3].answers[1].answer_id,
              questions[3].answers[2].answer_id,
              questions[3].answers[3].answer_id,
            ],
          },
        ],
      };

      const result = await quizResolver.submitQuiz(submitQuizInput);

      expect(result).toBeTruthy();

      await quizResolver.deleteQuiz(quizId, teacher.id);
      await userResolver.removeUser(teacher.id);
      await userResolver.removeUser(user.id);
    });

    it('should throw an error when quiz is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(null);

      const submitQuizInput = {
        quiz_id: 999,
        user_id: 2,
        answers: [
          {
            question_id: 1,
            answer_id: 1,
            answer_ids: [2],
          },
        ],
      };

      try {
        await quizResolver.submitQuiz(submitQuizInput);
      } catch (e) {
        expect(e.message).toEqual('Quiz not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        questions: [
          {
            question_id: 1,
            question_text: 'What is 1+1?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_id: 1, answer_text: '1', is_correct: false },
              { answer_id: 2, answer_text: '2', is_correct: true },
              { answer_id: 3, answer_text: '3', is_correct: false },
              { answer_id: 4, answer_text: '4', is_correct: false },
            ],
          },
        ],
        ...new Quiz(),
      });

      const submitQuizInput = {
        quiz_id: 1,
        user_id: 2,
        answers: [
          {
            question_id: 1,
            answer_id: 1,
            answer_ids: [2],
          },
        ],
      };

      try {
        await quizResolver.submitQuiz(submitQuizInput);
      } catch (e) {
        expect(e.message).toEqual('User not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when user does not have access to the quiz', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        questions: [
          {
            question_id: 1,
            question_text: 'What is 1+1?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_id: 1, answer_text: '1', is_correct: false },
              { answer_id: 2, answer_text: '2', is_correct: true },
              { answer_id: 3, answer_text: '3', is_correct: false },
              { answer_id: 4, answer_text: '4', is_correct: false },
            ],
          },
        ],
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        access_id: '1',
        is_public: false,
        users_with_access: [],
        ...new QuizAccess(),
      });

      const submitQuizInput = {
        quiz_id: 1,
        user_id: 2,
        answers: [
          {
            question_id: 1,
            answer_id: 1,
            answer_ids: [2],
          },
        ],
      };

      try {
        await quizResolver.submitQuiz(submitQuizInput);
      } catch (e) {
        expect(e.message).toEqual('User does not have access to this quiz');
        expect(e.getStatus()).toEqual(HttpStatus.FORBIDDEN);
      }
    });

    it('should throw an error when the quiz is already submitted', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        questions: [
          {
            question_id: 1,
            question_text: 'What is 1+1?',
            question_type: QuestionType.single,
            points: 1,
            answers: [
              { answer_id: 1, answer_text: '1', is_correct: false },
              { answer_id: 2, answer_text: '2', is_correct: true },
              { answer_id: 3, answer_text: '3', is_correct: false },
              { answer_id: 4, answer_text: '4', is_correct: false },
            ],
          },
        ],
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        access_id: '1',
        is_public: true,
        users_with_access: [],
        ...new QuizAccess(),
      });

      jest.spyOn(quizResultRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        score: 1,
        total: 1,
        ...new QuizResult(),
      });

      const submitQuizInput = {
        quiz_id: 1,
        user_id: 2,
        answers: [
          {
            question_id: 1,
            answer_id: 1,
            answer_ids: [2],
          },
        ],
      };

      try {
        await quizResolver.submitQuiz(submitQuizInput);
      } catch (e) {
        expect(e.message).toEqual('Quiz already submitted');
        expect(e.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('getQuizResultStudent', () => {
    it('should get quiz result for a student', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizResultRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        score: 1,
        total: 1,
        author: {
          user_id: 2,
          ...new User(),
        },
        ...new QuizResult(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        access_id: '1',
        is_public: true,
        users_with_access: [],
        ...new QuizAccess(),
      });

      jest.spyOn(userAnswerRepository, 'find').mockResolvedValue([
        {
          user: {
            user_id: 2,
            username: 'user2',
            role: 'student',
            ...new User(),
          },
          question: {
            ...new Question(),
          },
          ...new UserAnswer(),
        },
      ]);

      const result = await quizResolver.getQuizResultStudent(1, 2);
      // expect it to be truthy
      expect(result).toBeTruthy();
    });

    it('should throw an error when user is not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        ...new Quiz(),
      });

      jest.spyOn(quizResultRepository, 'findOne').mockResolvedValue(null);

      try {
        await quizResolver.getQuizResultStudent(1, 2);
      } catch (e) {
        expect(e.message).toEqual('User not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when quiz is not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(null);

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      try {
        await quizResolver.getQuizResultStudent(1, 2);
      } catch (e) {
        expect(e.message).toEqual('Quiz not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when user does not have access to the quiz', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        is_public: false,
        users_with_access: [],
        ...new QuizAccess(),
      });

      try {
        await quizResolver.getQuizResultStudent(1, 2);
      } catch (e) {
        expect(e.message).toEqual('User does not have access to this quiz');
        expect(e.getStatus()).toEqual(HttpStatus.FORBIDDEN);
      }
    });

    it('should throw an error when quiz result is not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        access_id: '1',
        is_public: true,
        users_with_access: [],
        ...new QuizAccess(),
      });

      jest.spyOn(quizResultRepository, 'findOne').mockResolvedValue(null);

      try {
        await quizResolver.getQuizResultStudent(1, 2);
      } catch (e) {
        expect(e.message).toEqual('Result not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when user answer is not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        access_id: '1',
        is_public: true,
        users_with_access: [],
        ...new QuizAccess(),
      });

      jest.spyOn(quizResultRepository, 'findOne').mockResolvedValue({
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        score: 1,
        total: 1,
        ...new QuizResult(),
      });

      jest.spyOn(userAnswerRepository, 'find').mockResolvedValue([]);

      try {
        await quizResolver.getQuizResultStudent(1, 2);
      } catch (e) {
        expect(e.message).toEqual('User answers not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getQuizResultsTeacher', () => {
    it('should get quiz results for a teacher', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        author: {
          user_id: 1,
          username: 'user1',
          role: 'teacher',
          ...new User(),
        },
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 1,
        username: 'user1',
        role: 'teacher',
        ...new User(),
      });

      jest.spyOn(quizResultRepository, 'find').mockResolvedValue([
        {
          quiz: {
            quiz_id: 1,
            quiz_name: 'Quiz 1',
            ...new Quiz(),
          },
          score: 1,
          total: 1,
          author: {
            user_id: 2,
            username: 'user2',
            role: 'student',
            ...new User(),
          },
          ...new QuizResult(),
        },
      ]);

      const result = await quizResolver.getQuizResultsTeacher(1, 1);
      expect(result).toBeTruthy();
    });

    it('should throw an error when quiz is not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(null);

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 1,
        username: 'user1',
        role: 'teacher',
        ...new User(),
      });

      try {
        await quizResolver.getQuizResultsTeacher(1, 1);
      } catch (e) {
        expect(e.message).toEqual('Quiz not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when user is not the author of the quiz', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        author: {
          user_id: 2,
          username: 'user2',
          role: 'teacher',
          ...new User(),
        },
        ...new Quiz(),
      });

      try {
        await quizResolver.getQuizResultsTeacher(1, 1);
      } catch (e) {
        expect(e.message).toEqual('User is not the author of the quiz');
        expect(e.getStatus()).toEqual(HttpStatus.FORBIDDEN);
      }
    });

    it('should throw an error when quiz results are not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        author: {
          user_id: 1,
          username: 'user1',
          role: 'teacher',
          ...new User(),
        },
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 1,
        username: 'user1',
        role: 'teacher',
        ...new User(),
      });

      jest.spyOn(quizResultRepository, 'find').mockResolvedValue([]);

      try {
        await quizResolver.getQuizResultsTeacher(1, 1);
      } catch (e) {
        expect(e.message).toEqual('Results not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('grantAccessToQuiz', () => {
    it('should grant access to a quiz', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 1,
        username: 'user1',
        role: 'teacher',
        ...new User(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue(null);

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        access_id: '1',
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        is_public: false,
        users_with_access: [],
        ...new QuizAccess(),
      });

      jest.spyOn(quizAccessRepository, 'save').mockResolvedValue({
        access_id: '1',
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        is_public: false,
        users_with_access: [],
        ...new QuizAccess(),
      });

      const result = await quizResolver.grantAcces(1, 1, 2);
      expect(result).toBeTruthy();
    });

    it('should throw an error when quiz is not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(null);

      try {
        await quizResolver.grantAcces(1, 1, 2);
      } catch (e) {
        expect(e.message).toEqual('Quiz not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when user is not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      try {
        await quizResolver.grantAcces(1, 1, 2);
      } catch (e) {
        expect(e.message).toEqual('User not found');
        expect(e.getStatus()).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an error when quiz is already public', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 1,
        username: 'user1',
        role: 'teacher',
        ...new User(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        access_id: '1',
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        is_public: true,
        users_with_access: [],
        ...new QuizAccess(),
      });

      try {
        await quizResolver.grantAcces(1, 1, 2);
      } catch (e) {
        expect(e.message).toEqual('Quiz is already public');
        expect(e.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an error when user already has access to the quiz', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue({
        quiz_id: 1,
        quiz_name: 'Quiz 1',
        ...new Quiz(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 1,
        username: 'user1',
        role: 'teacher',
        ...new User(),
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        user_id: 2,
        username: 'user2',
        role: 'student',
        ...new User(),
      });

      jest.spyOn(quizAccessRepository, 'findOne').mockResolvedValue({
        access_id: '1',
        quiz: {
          quiz_id: 1,
          quiz_name: 'Quiz 1',
          ...new Quiz(),
        },
        is_public: false,
        users_with_access: [2],
        ...new QuizAccess(),
      });

      try {
        await quizResolver.grantAcces(1, 2, 1);
      } catch (e) {
        expect(e.message).toEqual('User already has access to this quiz');
        expect(e.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
