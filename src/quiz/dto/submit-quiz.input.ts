import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

@InputType()
class SubmitAnswerInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  question_id: number;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ValidateNested({ each: true })
  answer_ids?: number[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  answer_response?: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ValidateNested({ each: true })
  sorted_answers?: number[];
}

@InputType()
export class SubmitQuizInput {
  @Field(() => ID)
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @Field(() => ID)
  @IsInt()
  @IsNotEmpty()
  quiz_id: number;

  @Field(() => [SubmitAnswerInput])
  @IsNotEmpty()
  answers: SubmitAnswerInput[];
}
