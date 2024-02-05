import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import { User } from 'src/user/entities/user.entity';
import { Answer } from './answer.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('useranswers')
export class UserAnswer {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  user_answer_id: number;

  @Column()
  @Field(() => ID)
  question_id: number;

  @ManyToOne(() => Question, (question) => question.answers)
  @Field(() => Question)
  question: Question;

  @Column()
  @Field(() => ID)
  user_id: number;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column({ nullable: true })
  @Field(() => ID, { nullable: true })
  answer_id: number;

  @OneToOne(() => Answer, { nullable: true })
  @Field(() => Answer, { nullable: true })
  answer: Answer;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  custom_answer_text: string;

  @Column('int', { array: true, nullable: true })
  @Field(() => [Int], { nullable: true })
  sorted_answers: number[];
}
