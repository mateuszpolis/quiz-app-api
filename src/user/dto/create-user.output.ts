import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateUserOutput {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  role: 'teacher' | 'student';
}
