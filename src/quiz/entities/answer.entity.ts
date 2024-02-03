import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';

@ObjectType()
export class Answer {
  @Field(() => ID)
  answer_id: number;
  @Field(() => Question)
  question: Question;
  @Field(() => String, { nullable: true })
  answer_text: string;
  @Field(() => Boolean)
  is_correct: boolean;
  @Field(() => Int, { nullable: true })
  order: number;
}
