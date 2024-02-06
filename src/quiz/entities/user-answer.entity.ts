import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';

@ObjectType()
@Entity('useranswers')
export class UserAnswer {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  user_answer_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quiz_id' })
  @Field(() => Quiz)
  quiz: Quiz;

  @ManyToOne(() => Question, (question) => question.answers)
  @JoinColumn({ name: 'question_id' })
  @Field(() => Question)
  question: Question;

  @Column('int', { array: true, nullable: true })
  @Field(() => [ID], { nullable: true })
  answer_ids?: number[];

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  answer_text?: string;

  @Column('int', { array: true, nullable: true })
  @Field(() => [ID], { nullable: true })
  sorted_answers?: number[];

  @Column()
  @Field(() => Float)
  score: number;
}
