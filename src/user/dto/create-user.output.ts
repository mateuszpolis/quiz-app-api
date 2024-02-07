import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateUserOutput {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  role: 'teacher' | 'student';
}
