import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SubmitQuizOutput {
  @Field(() => Number)
  score: number;

  @Field(() => Number)
  total: number;
}
