import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { HttpException } from '@nestjs/common';
import { CreateUserOutput } from './dto/create-user.output';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => CreateUserOutput)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<CreateUserOutput> {
    try {
      return await this.userService.create(createUserInput);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  @Mutation(() => CreateUserOutput)
  async removeUser(@Args('id') id: number): Promise<CreateUserOutput> {
    try {
      const userToRemove = await this.userService.remove(id);
      return userToRemove;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
}
