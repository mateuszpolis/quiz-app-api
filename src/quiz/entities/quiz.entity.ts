import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';

@ObjectType()
export class Quiz {
  @Field(() => ID)
  quiz_id: number;
  @Field(() => String)
  quiz_name: string;
  @Field(() => String, { nullable: true })
  description: string;
  @Field(() => [Question], { nullable: true })
  questions: Question[];
}
