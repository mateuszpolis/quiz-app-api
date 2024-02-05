import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import { User } from 'src/user/entities/user.entity';
import { Answer } from './answer.entity';
import {
  Column,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
export class UserAnswers {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  user_answer_id: number;

  @ManyToOne(() => Question, (question) => question.answers)
  @JoinColumn({ name: 'question_id' })
  @Field(() => Question)
  question: Question;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User;

  @OneToOne(() => Answer, { nullable: true })
  @JoinColumn({ name: 'answer_id' })
  @Field(() => Answer, { nullable: true })
  answer: Answer;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  custom_answer_text: string;

  @Column('int', { array: true, nullable: true })
  @Field(() => [Int], { nullable: true })
  sorted_answers: number[];
}
