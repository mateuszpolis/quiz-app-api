import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@ObjectType()
export class SubmitQuizOutput {
  @Field(() => Number)
  score: number;

  @Field(() => Number)
  total: number;

  @Field(() => ID)
  quiz_id: number;

  @Field(() => ID)
  @IsOptional()
  user_id?: number;
}
