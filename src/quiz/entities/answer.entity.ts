import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  answer_id: number;

  @ManyToOne(() => Question, (question) => question.answers)
  @JoinColumn({ name: 'question_id' })
  @Field(() => Question)
  question?: Question;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  answer_text: string;

  @Column({ default: false })
  @Field(() => Boolean)
  is_correct?: boolean;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  order?: number;
}
