import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { User } from '../..//user/entities/user.entity';

@ObjectType()
@Entity('quiz_access')
export class QuizAccess {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  access_id: string;

  @OneToOne(() => Quiz)
  @JoinColumn({ name: 'quiz_id' })
  @Field(() => Quiz)
  quiz: Quiz;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  @Field(() => User)
  author: User;

  @Column({ default: false })
  @Field(() => Boolean)
  is_public?: boolean;

  @Column('int', { array: true, nullable: true })
  @Field(() => [ID], { nullable: true })
  users_with_access: number[];
}
