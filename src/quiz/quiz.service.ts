import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Repository } from 'typeorm';
import { CreateQuizInput } from './dto/create-quiz.input';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async createQuiz(createQuizInput: CreateQuizInput): Promise<Quiz> {
    return await this.quizRepository.manager.transaction(async (manager) => {
      console.log('before create quiz', createQuizInput);
      const quiz = manager.create(Quiz, createQuizInput);
      console.log('after create quiz', quiz);
      await manager.save(quiz);
      console.log('after save quiz', quiz);

      for (const questionInput of createQuizInput.questions) {
        const question = manager.create(Question, {
          ...questionInput,
          quiz_id: quiz.quiz_id,
        });
        await manager.save(question);

        for (const answerInput of questionInput.answers) {
          const answer = manager.create(Answer, {
            ...answerInput,
            question_id: question.question_id,
          });
          await manager.save(answer);
        }
      }

      return quiz;
    });
  }
}
