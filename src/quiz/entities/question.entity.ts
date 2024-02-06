import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
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
import { UserAnswer } from './user-answer.entity';

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
  @PrimaryGeneratedColumn('increment')
  @Field(() => ID)
  question_id: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  @Field(() => Quiz)
  quiz: Quiz;

  @Column()
  @Field(() => Number)
  points: number;

  @Column()
  @Field(() => String)
  question_text: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  @Field(() => QuestionType)
  question_type: QuestionType;

  @OneToMany(() => Answer, (answer) => answer.question)
  @Field(() => [Answer], { nullable: true })
  answers: Answer[];

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.user)
  @Field(() => [UserAnswer], { nullable: true })
  user_anwers: UserAnswer[];
}
