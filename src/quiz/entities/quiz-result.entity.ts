import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
@Entity('quiz_results')
export class QuizResult {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  result_id: string;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quiz_id' })
  @Field(() => Quiz)
  quiz: Quiz;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  @Field(() => User)
  author: User;

  @Column('float')
  @Field(() => Number)
  score: number;

  @Column('float')
  @Field(() => Number)
  total: number;
}
