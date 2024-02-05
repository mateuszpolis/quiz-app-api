import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Repository } from 'typeorm';
import { CreateQuizInput } from './dto/create-quiz.input';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { User } from 'src/user/entities/user.entity';
import { QuizAccess } from './entities/quizacces.entity';
import { SubmitQuizInput } from './dto/submit-quiz.input';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(QuizAccess)
    private quizAccessRepository: Repository<QuizAccess>,
  ) {}

  async create(createQuizInput: CreateQuizInput): Promise<Quiz> {
    const author = await this.userRepository.findOne({
      where: { user_id: createQuizInput.author_id },
    });
    if (!author) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (author.role !== 'teacher') {
      throw new HttpException('User is not a teacher', HttpStatus.NOT_FOUND);
    }

    return await this.quizRepository.manager.transaction(async (manager) => {
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
        await manager.save(question);

        if (!questionInput.answers || questionInput.answers.length === 0) {
          continue;
        }

        for (const answerInput of questionInput.answers) {
          const answer = manager.create(Answer, {
            ...answerInput,
            question: question,
          });
          await manager.save(answer);
        }
      }

      return quiz;
    });
  }

  async findQuizzById(quiz_id: number, user_id: number): Promise<Quiz> {
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
      return quiz;
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

    const questions = quiz.questions;
    let score: number = 0;
    let total: number = 0;
    for (const answerInput of submitQuizInput.answers) {
      const question = questions.find((question) => {
        return question.question_id === answerInput.question_id;
      });
      if (!question) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }
      total++;
      let localScore: number = 0;
      if (question.question_type === 'single') {
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
          score++;
        }
      } else if (question.question_type === 'multiple') {
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
        score += localScore / correctAnswers.length;
      } else if (question.question_type === 'text') {
        if (!answerInput.answer_text) {
          throw new HttpException(
            'Answer for text question not provided',
            HttpStatus.BAD_REQUEST,
          );
        }
        if (
          question.answers[0].answer_text
            .toLowerCase()
            .replace(/[^\w\s]|_/g, '')
            .replace(/\s+/g, ' ')
            .trim() ===
          answerInput.answer_text
            .toLowerCase()
            .replace(/[^\w\s]|_/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        ) {
          score++;
        }
      } else if (question.question_type === 'sorting') {
        const correctAnswers = question.answers.sort(
          (a, b) => a.order - b.order,
        );
        for (let i = 0; i < correctAnswers.length; i++) {
          if (correctAnswers[i].answer_id === answerInput.sorted_answers[i]) {
            localScore++;
          }
        }
        score += localScore / correctAnswers.length;
      }
    }
    return { score, total };
  }
}
