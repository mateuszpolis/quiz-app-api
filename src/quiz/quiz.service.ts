import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Repository } from 'typeorm';
import { CreateQuizInput } from './dto/create-quiz.input';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { User } from 'src/user/entities/user.entity';
import { QuizAccess } from './entities/quizacces.entity';

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
}
