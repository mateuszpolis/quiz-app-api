import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const user = this.usersRepository.create(createUserInput);
    return this.usersRepository.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async remove(id: number): Promise<User | undefined> {
    const userToRemove = await this.usersRepository.findOne({
      where: { user_id: id },
    });
    if (!userToRemove) {
      return undefined;
    }
    await this.usersRepository.delete(id);
    return userToRemove;
  }
}
