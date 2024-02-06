import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserAnswer } from '../entities/user-answer.entity';
import { IsArray, IsOptional } from 'class-validator';

@ObjectType()
export class QuizResultsOutput {
  @Field(() => Number)
  score: number;

  @Field(() => Number)
  total: number;

  @Field(() => ID)
  quiz_id: number;

  @Field(() => ID)
  @IsOptional()
  user_id?: number;

  @Field(() => [UserAnswer], { nullable: true })
  @IsArray()
  user_answers: UserAnswer[];
}
