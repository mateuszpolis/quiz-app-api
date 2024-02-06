import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../entities/question.entity';
import { Type } from 'class-transformer';

@InputType()
class AnswerInput {
  @Field(() => String)
  @IsString()
  answer_text: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  answer_response?: string;

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}

@InputType()
class QuestionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @Field(() => QuestionType)
  @IsNotEmpty()
  question_type: QuestionType;

  @Field(() => Number, { defaultValue: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  points: number;

  @Field(() => [AnswerInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerInput)
  answers: AnswerInput[];
}

@InputType()
export class CreateQuizInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  quiz_name: string;

  @Field(() => ID)
  @IsInt()
  @IsNotEmpty()
  author_id: number;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsNotEmpty()
  is_public: boolean;

  @Field(() => [ID], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  users_with_access?: number[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [QuestionInput])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionInput)
  questions: QuestionInput[];
}
