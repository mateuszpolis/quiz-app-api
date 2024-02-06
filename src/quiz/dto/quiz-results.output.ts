import { Field, ObjectType } from '@nestjs/graphql';
import { UserAnswer } from '../entities/user-answer.entity';
import { IsArray } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class QuizResultsOutput {
  @Field(() => Number)
  score: number;

  @Field(() => Number)
  total: number;

  @Field(() => User)
  user: User;

  @Field(() => [UserAnswer], { nullable: true })
  @IsArray()
  user_answers: UserAnswer[];
}
