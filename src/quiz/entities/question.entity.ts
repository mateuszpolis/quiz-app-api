import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Quiz } from './quiz.entity';
import { Answer } from './answer.entity';

@ObjectType()
export class Question {
  @Field(() => ID)
  question_id: number;
  @Field(() => Quiz)
  quiz: Quiz;
  @Field(() => String)
  question_text: string;
  @Field()
  question_type: 'single' | 'multiple' | 'sorting' | 'text';
  @Field(() => Int)
  order: number;
  @Field(() => [Answer], { nullable: true })
  answers: Answer[];
}
