import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizInput } from './dto/create-quiz.input';
import { QuizService } from './quiz.service';
import { HttpException } from '@nestjs/common';

@Resolver()
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  @Mutation(() => Quiz)
  async createQuiz(
    @Args('createQuizInput') createQuizInput: CreateQuizInput,
  ): Promise<Quiz> {
    try {
      return await this.quizService.create(createQuizInput);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
}
