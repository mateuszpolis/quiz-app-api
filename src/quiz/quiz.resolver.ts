import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateQuizInput } from './dto/create-quiz.input';
import { QuizService } from './quiz.service';
import { HttpException } from '@nestjs/common';
import { SubmitQuizInput } from './dto/submit-quiz.input';
import { SubmitQuizOutput } from './dto/submit-quiz.output';
import { QuizResultsOutput } from './dto/quiz-results.output';
import { QuestionOuptut } from './dto/question-output';

@Resolver()
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  @Mutation(() => ID)
  async createQuiz(
    @Args('createQuizInput') createQuizInput: CreateQuizInput,
  ): Promise<number> {
    try {
      return await this.quizService.create(createQuizInput);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  @Query(() => [QuestionOuptut])
  async getQuestionsForQuiz(
    @Args('quiz_id') quiz_id: number,
    @Args('user_id') user_id: number,
  ): Promise<QuestionOuptut[]> {
    try {
      return await this.quizService.getQuizQuestions(quiz_id, user_id);
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

  @Mutation(() => Boolean)
  async grantAcces(
    @Args('quiz_id') quiz_id: number,
    @Args('user_id') user_id: number,
  ): Promise<boolean> {
    try {
      return await this.quizService.grantAccessToQuiz(quiz_id, user_id);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  @Mutation(() => Boolean)
  async delteQuiz(
    @Args('quiz_id') quiz_id: number,
    @Args('user_id') user_id: number,
  ): Promise<boolean> {
    try {
      return await this.quizService.delteQuiz(quiz_id, user_id);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
}
