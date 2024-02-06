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

  @Column()
  @Field(() => String)
  answer_text: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  answer_response?: string;

  @Column({ default: null })
  @Field(() => Boolean)
  is_correct?: boolean;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  order?: number;
}
