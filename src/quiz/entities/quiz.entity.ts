import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('increment')
  @Field(() => ID)
  quiz_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ unique: true })
  @Field(() => String)
  quiz_name: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  description: string;

  @OneToMany(() => Question, (question) => question.quiz)
  @Field(() => [Question])
  questions: Question[];
}
