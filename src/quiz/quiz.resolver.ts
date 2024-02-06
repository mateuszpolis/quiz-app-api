import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizInput } from './dto/create-quiz.input';
import { QuizService } from './quiz.service';
import { HttpException } from '@nestjs/common';
import { SubmitQuizInput } from './dto/submit-quiz.input';
import { SubmitQuizOutput } from './dto/submit-quiz.output';
import { QuizResultsOutput } from './dto/quiz-results.output';

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

  @Query(() => Quiz)
  async getQuizById(
    @Args('quiz_id') quiz_id: number,
    @Args('user_id') user_id: number,
  ): Promise<Quiz> {
    try {
      return await this.quizService.findQuizzById(quiz_id, user_id);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  @Mutation(() => SubmitQuizOutput)
  async submitQuiz(
    @Args('submitAnswersInput') submitQuizInput: SubmitQuizInput,
  ): Promise<{ score: number; total: number }> {
    try {
      return await this.quizService.submitQuiz(submitQuizInput);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  @Query(() => QuizResultsOutput)
  async getQuizResultStudent(
    @Args('quiz_id') quiz_id: number,
    @Args('user_id') user_id: number,
  ): Promise<QuizResultsOutput> {
    try {
      return await this.quizService.getResultStudent(quiz_id, user_id);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  @Query(() => [QuizResultsOutput])
  async getQuizResultsTeacher(
    @Args('quiz_id') quiz_id: number,
    @Args('user_id') user_id: number,
  ): Promise<QuizResultsOutput[]> {
    try {
      return await this.quizService.getResultsTeacher(quiz_id, user_id);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
}
