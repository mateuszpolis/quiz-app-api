import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class SubmitQuizOutput {
  @Field(() => Number)
  score: number;

  @Field(() => Number)
  total: number;

  @Field(() => ID)
  quiz_id: number;

  @Field(() => ID)
  user_id: number;
}
