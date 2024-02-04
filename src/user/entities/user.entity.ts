import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  user_id: number;
  @Field()
  @Column({ unique: true })
  username: string;
  @Field()
  @Column({ unique: true })
  email: string;
  @Field()
  @Column()
  role: 'teacher' | 'student';
}
