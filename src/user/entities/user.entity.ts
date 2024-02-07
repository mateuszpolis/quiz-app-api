import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Quiz } from '../../quiz/entities/quiz.entity';
import { QuizAccess } from '../../quiz/entities/quizacces.entity';
import { UserAnswer } from '../../quiz/entities/user-answer.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment')
  user_id: number;

  @Field()
  @Column({ unique: true })
  username: string;

  @Field()
  @Column()
  role: 'teacher' | 'student';

  @OneToMany(() => Quiz, (quiz) => quiz.author)
  @Field(() => [Quiz], { nullable: true })
  quizzes: Quiz[];

  @OneToMany(() => QuizAccess, (quizAccess) => quizAccess.author)
  @Field(() => [QuizAccess], { nullable: true })
  access: QuizAccess[];

  @OneToMany(() => Quiz, (quiz) => quiz.author)
  @Field(() => [Quiz], { nullable: true })
  quiz_results: Quiz[];

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.user)
  @Field(() => [UserAnswer], { nullable: true })
  answers: UserAnswer[];
}
