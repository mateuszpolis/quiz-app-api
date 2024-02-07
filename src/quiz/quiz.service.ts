import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateQuizInput } from './dto/create-quiz.input';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { User } from 'src/user/entities/user.entity';
import { QuizAccess } from './entities/quizacces.entity';
import { SubmitQuizInput } from './dto/submit-quiz.input';
import { QuizResult } from './entities/quiz-result.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { QuizResultsOutput } from './dto/quiz-results.output';
import { QuestionOuptut } from './dto/question-output';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(QuizAccess)
    private readonly quizAccessRepository: Repository<QuizAccess>,
    @InjectRepository(QuizResult)
    private readonly quizResultRepository: Repository<QuizResult>,
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepository: Repository<UserAnswer>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async create(createQuizInput: CreateQuizInput): Promise<number> {
    const author = await this.userRepository.findOne({
      where: { user_id: createQuizInput.author_id },
    });
    if (!author) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (author.role !== 'teacher') {
      throw new HttpException('User is not a teacher', HttpStatus.NOT_FOUND);
    }

    const quiz = await this.quizRepository.findOne({
      where: { quiz_name: createQuizInput.quiz_name },
      relations: ['author'],
    });
    if (quiz && quiz.author.user_id === author.user_id) {
      throw new HttpException(
        'Quiz with this name already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.entityManager.transaction(async (manager) => {
      const quiz = manager.create(Quiz, {
        ...createQuizInput,
        author: author,
      });
      await manager.save(quiz);

      const quizAccess = manager.create(QuizAccess, {
        quiz,
        author,
        is_public: createQuizInput.is_public,
        users_with_access: createQuizInput.is_public
          ? null
          : createQuizInput.users_with_access,
      });
      await manager.save(quizAccess);

      for (const questionInput of createQuizInput.questions) {
        const question = manager.create(Question, {
          ...questionInput,
          quiz: quiz,
        });
        await manager.save(Question, question, { reload: false });
        console.log(question);

        if (!questionInput.answers || questionInput.answers.length === 0) {
          continue;
        }

        for (const answerInput of questionInput.answers) {
          const answer = manager.create(Answer, {
            ...answerInput,
            question: question,
          });
          await manager.save(Answer, answer, { reload: false });
        }
      }

      return quiz.quiz_id;
    });
  }

  async getQuizQuestions(
    quiz_id: number,
    user_id: number,
  ): Promise<QuestionOuptut[]> {
    const quiz = await this.quizRepository.findOne({
      where: { quiz_id: quiz_id },
      relations: ['questions', 'questions.answers'],
    });
    if (!quiz) {
      throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
    }
    const quizAccess = await this.quizAccessRepository.findOne({
      where: { quiz: quiz },
    });

    if (
      quizAccess.is_public ||
      quizAccess.users_with_access.includes(user_id)
    ) {
      const questions = quiz.questions;
      const questionsOutput: QuestionOuptut[] = [];
      for (const question of questions) {
        questionsOutput.push({
          question_id: question.question_id,
          question_text: question.question_text,
          question_type: question.question_type,
          points: question.points,
          answers: question.answers,
        });
      }
      return questionsOutput;
    } else {
      throw new HttpException(
        'User does not have access',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async submitQuiz(
    submitQuizInput: SubmitQuizInput,
  ): Promise<{ score: number; total: number }> {
    const user = await this.userRepository.findOne({
      where: { user_id: submitQuizInput.user_id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const quiz = await this.quizRepository.findOne({
      where: { quiz_id: submitQuizInput.quiz_id },
      relations: ['questions', 'questions.answers'],
    });
    if (!quiz) {
      throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
    }
    const quizAccess = await this.quizAccessRepository.findOne({
      where: { quiz: quiz },
    });
    if (!quizAccess.is_public) {
      if (!quizAccess.users_with_access.includes(user.user_id)) {
        throw new HttpException(
          'User does not have access to this quiz',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const quizResult = await this.quizResultRepository.findOne({
      where: { quiz: quiz, author: user },
    });
    if (quizResult) {
      throw new HttpException('Quiz already submitted', HttpStatus.BAD_REQUEST);
    }

    const questions = quiz.questions;
    let score: number = 0;
    let total: number = 0;
    await this.entityManager.transaction(async (manager) => {
      for (const answerInput of submitQuizInput.answers) {
        const question = questions.find((question) => {
          return question.question_id === answerInput.question_id;
        });
        if (!question) {
          throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
        }
        total += question.points;
        let questionScore: number = 0;
        if (question.question_type === 'single') {
          let localScore: number = 0;
          if (!answerInput.answer_ids || answerInput.answer_ids.length === 0) {
            throw new HttpException(
              'Answer for single question not provided',
              HttpStatus.BAD_REQUEST,
            );
          }
          const correctAnswers = question.answers.find(
            (answer) => answer.is_correct === true,
          );
          if (correctAnswers.answer_id === answerInput.answer_ids[0]) {
            score += question.points;
            localScore += question.points;
            questionScore = localScore;
          }
        } else if (question.question_type === 'multiple') {
          let localScore: number = 0;
          if (!answerInput.answer_ids || answerInput.answer_ids.length === 0) {
            throw new HttpException(
              'Answer for multiple question not provided',
              HttpStatus.BAD_REQUEST,
            );
          }
          const correctAnswers = question.answers.filter(
            (answer) => answer.is_correct === true,
          );
          const correctAnswerIds = correctAnswers.map(
            (correctAnswer) => correctAnswer.answer_id,
          );
          for (const answerId of answerInput.answer_ids) {
            if (correctAnswerIds.includes(answerId)) {
              localScore++;
            } else {
              localScore--;
            }
          }
          score +=
            (localScore > 0 ? localScore * question.points : 0) /
            correctAnswers.length;
          questionScore =
            (localScore > 0 ? localScore * question.points : 0) /
            correctAnswers.length;
        } else if (question.question_type === 'text') {
          let localScore: number = 0;
          if (!answerInput.answer_response) {
            throw new HttpException(
              'Answer for text question not provided',
              HttpStatus.BAD_REQUEST,
            );
          }
          if (
            question.answers[0].answer_response
              .toLowerCase()
              .replace(/[^\w\s]|_/g, '')
              .replace(/\s+/g, ' ')
              .trim() ===
            answerInput.answer_response
              .toLowerCase()
              .replace(/[^\w\s]|_/g, '')
              .replace(/\s+/g, ' ')
              .trim()
          ) {
            localScore += question.points;
            score += question.points;
            questionScore = localScore;
          }
        } else if (question.question_type === 'sorting') {
          if (
            !answerInput.sorted_answers ||
            answerInput.sorted_answers.length !== question.answers.length
          ) {
            throw new HttpException(
              'Answer for sorting question not provided',
              HttpStatus.BAD_REQUEST,
            );
          }
          let localScore: number = 0;
          console.log('1');
          const correctAnswers = question.answers.sort(
            (a, b) => a.order - b.order,
          );
          for (let i = 0; i < correctAnswers.length; i++) {
            if (correctAnswers[i].answer_id === answerInput.sorted_answers[i]) {
              localScore++;
            }
          }
          console.log('3');
          score += (localScore / correctAnswers.length) * question.points;
          questionScore =
            (localScore / correctAnswers.length) * question.points;
          console.log('4');
        }

        const userAnswer = manager.create(UserAnswer, {
          user,
          quiz,
          question,
          answer_ids: answerInput.answer_ids,
          answer_response: answerInput.answer_response,
          sorted_answers: answerInput.sorted_answers,
          score: questionScore > 0 ? questionScore : 0,
        });
        await manager.save(UserAnswer, userAnswer);
      }

      const newQuizResult = manager.create(QuizResult, {
        quiz,
        author: user,
        score,
        total,
      });
      await manager.save(newQuizResult);
    });

    return { score, total };
  }

  async getResultStudent(
    quiz_id: number,
    user_id: number,
  ): Promise<QuizResultsOutput> {
    const quiz = await this.quizRepository.findOne({
      where: { quiz_id: quiz_id },
    });
    if (!quiz) {
      throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
    }
    const user = await this.userRepository.findOne({
      where: { user_id: user_id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const quizAccess = await this.quizAccessRepository.findOne({
      where: { quiz: quiz },
    });
    if (!quizAccess.is_public) {
      if (!quizAccess.users_with_access.includes(user.user_id)) {
        throw new HttpException(
          'User does not have access to this quiz',
          HttpStatus.FORBIDDEN,
        );
      }
    }
    const quizResult = await this.quizResultRepository.findOne({
      where: { quiz: quiz, author: user },
      relations: ['quiz', 'author'],
    });
    if (!quizResult) {
      throw new HttpException('Result not found', HttpStatus.NOT_FOUND);
    }
    const userAnswers = await this.userAnswerRepository.find({
      where: { quiz: quiz, user: user },
      relations: ['question', 'question.answers'],
    });
    if (userAnswers.length === 0) {
      throw new HttpException('User answers not found', HttpStatus.NOT_FOUND);
    }

    return {
      score: quizResult.score,
      total: quizResult.total,
      user: user,
      user_answers: userAnswers,
    };
  }

  async getResultsTeacher(
    quiz_id: number,
    teacher_id: number,
  ): Promise<QuizResultsOutput[]> {
    const quiz = await this.quizRepository.findOne({
      where: { quiz_id: quiz_id },
      relations: ['author'],
    });
    if (!quiz) {
      throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
    }
    if (quiz.author.user_id !== teacher_id) {
      throw new HttpException(
        'User is not the author of the quiz',
        HttpStatus.FORBIDDEN,
      );
    }
    const quizResults = await this.quizResultRepository.find({
      where: { quiz: quiz },
      relations: ['quiz', 'author'],
    });
    if (quizResults.length === 0) {
      throw new HttpException('Results not found', HttpStatus.NOT_FOUND);
    }
    const returnResults: QuizResultsOutput[] = [];
    for (const quizResult of quizResults) {
      const userAnswers = await this.userAnswerRepository.find({
        where: { quiz: quiz, user: quizResult.author },
        relations: ['question', 'question.answers'],
      });
      const user = await this.userRepository.findOne({
        where: { user_id: quizResult.author.user_id },
      });
      returnResults.push({
        score: quizResult.score,
        total: quizResult.total,
        user: user,
        user_answers: userAnswers,
      });
    }

    return returnResults;
  }

  async grantAccessToQuiz(quiz_id: number, user_id: number): Promise<boolean> {
    const quiz = await this.quizRepository.findOne({
      where: { quiz_id: quiz_id },
      relations: ['author'],
    });
    if (!quiz) {
      throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
    }
    const user = await this.userRepository.findOne({
      where: { user_id: user_id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const quizAccess = await this.quizAccessRepository.findOne({
      where: { quiz: quiz },
    });
    if (quizAccess.is_public) {
      throw new HttpException('Quiz is already public', HttpStatus.BAD_REQUEST);
    }
    if (quizAccess.users_with_access.includes(user.user_id)) {
      throw new HttpException(
        'User already has access to this quiz',
        HttpStatus.BAD_REQUEST,
      );
    }
    quizAccess.users_with_access.push(user.user_id);
    await this.quizAccessRepository.save(quizAccess);
    return true;
  }

  async deleteQuiz(quiz_id: number, user_id: number): Promise<boolean> {
    const quiz = await this.quizRepository.findOne({
      where: { quiz_id: quiz_id },
      relations: ['author'],
    });
    if (!quiz) {
      throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
    }
    if (quiz.author.user_id !== user_id) {
      throw new HttpException(
        'User is not the author of the quiz',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.entityManager.transaction(async (manager) => {
      await manager.delete(Question, { quiz: quiz });
      await manager.delete(QuizAccess, { quiz: quiz });
      await manager.delete(QuizResult, { quiz: quiz });
      await manager.delete(Quiz, { quiz_id: quiz_id });
    });
    return true;
  }
}
