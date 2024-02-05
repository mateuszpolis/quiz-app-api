import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  quiz_id: number;

  @Column({ unique: true })
  @Field(() => String)
  quiz_name: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  description: string;

  @OneToMany(() => Question, (question) => question.quiz)
  @JoinColumn({ name: 'quiz_id' })
  @Field(() => [Question])
  questions: Question[];
}
