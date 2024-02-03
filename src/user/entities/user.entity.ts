import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  user_id: number;
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  role: 'teacher' | 'student';
}
