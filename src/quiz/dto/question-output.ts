import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsArray } from 'class-validator';
import { QuestionType } from '../entities/question.entity';

@ObjectType()
class AnswerOutput {
  @Field(() => ID)
  answer_id: number;

  @Field(() => String)
  answer_text: string;
}

@ObjectType()
export class QuestionOuptut {
  @Field(() => ID)
  question_id: number;

  @Field(() => Number)
  points: number;

  @Field(() => String)
  question_text: string;

  @Field(() => QuestionType)
  question_type: QuestionType;

  @Field(() => [AnswerOutput], { nullable: true })
  @IsArray()
  answers: AnswerOutput[];
}
