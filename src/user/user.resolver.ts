import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { HttpException } from '@nestjs/common';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    try {
      return await this.userService.create(createUserInput);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  @Mutation(() => User)
  async removeUser(@Args('id') id: number): Promise<User> {
    try {
      const userToRemove = await this.userService.remove(id);
      return userToRemove;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
}
