import { Field, InputType, Int } from '@nestjs/graphql';
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
export class AnswerInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  answer_text: string;

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  @IsBoolean()
  @IsOptional()
  is_correct?: boolean;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  order?: number;
}

@InputType()
export class QuestionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @Field(() => QuestionType)
  @IsNotEmpty()
  question_type: QuestionType;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order: number;

  @Field(() => [AnswerInput])
  @IsArray()
  @ArrayNotEmpty()
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
