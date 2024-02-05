import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Quiz } from './quiz.entity';
import { Answer } from './answer.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum QuestionType {
  single = 'single',
  multiple = 'multiple',
  sorting = 'sorting',
  text = 'text',
}

registerEnumType(QuestionType, {
  name: 'QuestionType',
});

@ObjectType()
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  question_id: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  @Field(() => Quiz)
  quiz: Quiz;

  @Column()
  @Field(() => String)
  question_text: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  @Field(() => QuestionType)
  question_type: QuestionType;

  @Column()
  @Field(() => Int)
  order: number;

  @OneToMany(() => Answer, (answer) => answer.question)
  @Field(() => [Answer], { nullable: true })
  answers: Answer[];
}
