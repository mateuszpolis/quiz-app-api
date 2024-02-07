import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { CreateUserOutput } from './dto/create-user.output';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<CreateUserOutput> {
    const userExists = await this.usersRepository.findOne({
      where: { username: createUserInput.username },
    });
    if (userExists) {
      throw new HttpException(
        'User with this username already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = this.usersRepository.create(createUserInput);
    await this.usersRepository.save(user);
    return {
      id: user.user_id,
      username: user.username,
      role: user.role,
    };
  }

  async remove(id: number): Promise<CreateUserOutput> {
    const userToRemove = await this.usersRepository.findOne({
      where: { user_id: id },
    });
    if (!userToRemove) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.usersRepository.delete(id);
    return {
      id: userToRemove.user_id,
      username: userToRemove.username,
      role: userToRemove.role,
    };
  }
}
