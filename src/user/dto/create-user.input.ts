import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  role: 'teacher' | 'student';
}
