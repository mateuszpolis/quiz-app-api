import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { Query } from '@nestjs/graphql';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return await this.userService.create(createUserInput);
  }

  @Query(() => [User])
  async findAllUsers(): Promise<User[]> {
    return await this.userService.findAllUsers();
  }

  @Mutation(() => User)
  async removeUser(@Args('id') id: number): Promise<User> {
    const userToRemove = await this.userService.remove(id);
    if (!userToRemove) {
      throw new Error(`User with id ${id} not found`);
    }
    return userToRemove;
  }
}
