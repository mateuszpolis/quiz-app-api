import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import { User } from 'src/user/entities/user.entity';
import { Answer } from './answer.entity';

@ObjectType()
export class UserAnswers {
  @Field(() => ID)
  user_answer_id: number;
  @Field(() => Question)
  question: Question;
  @Field(() => User)
  user: User;
  @Field(() => Answer)
  answer: Answer;
  @Field(() => String, { nullable: true })
  custom_answer_text: string;
  @Field(() => [Int], { nullable: true })
  sorted_answers: number[];
}
