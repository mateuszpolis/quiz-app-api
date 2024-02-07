import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { UserResolver } from '../user.resolver';
import { UserService } from '../user.service';
import { CreateUserOutput } from '../dto/create-user.output';
import { CreateUserInput } from '../dto/create-user.input';
import { AppModule } from '../../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResolver, UserService],
      imports: [AppModule, TypeOrmModule.forFeature([User])],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserInput: CreateUserInput = {
      username: 'user1',
      role: 'student',
    };

    const createUserOutput: CreateUserOutput = {
      id: 1,
      username: 'user1',
      role: 'student',
    };

    jest
      .spyOn(service, 'create')
      .mockImplementation(async () => createUserOutput);

    const result = await resolver.createUser(createUserInput);

    expect(result).toEqual(createUserOutput);
    expect(service.create).toHaveBeenCalledWith(createUserInput);
  });

  it('should throw an error when creating a user with an existing username', async () => {
    const createUserInput: CreateUserInput = {
      username: 'user1',
      role: 'student',
    };

    jest.spyOn(service, 'create').mockImplementation(async () => {
      throw new HttpException('User with this username already exists', 400);
    });

    try {
      await resolver.createUser(createUserInput);
    } catch (e) {
      expect(e.message).toEqual('User with this username already exists');
      expect(e.status).toEqual(400);
    }
  });

  it('should remove a user', async () => {
    const userId = 1;

    const createUserOutput: CreateUserOutput = {
      id: 1,
      username: 'user1',
      role: 'student',
    };

    jest
      .spyOn(service, 'remove')
      .mockImplementation(async () => createUserOutput);

    const result = await resolver.removeUser(userId);

    expect(result).toEqual(createUserOutput);
    expect(service.remove).toHaveBeenCalledWith(userId);
  });

  it('should throw an error when removing a non-existing user', async () => {
    const userId = 1;

    jest.spyOn(service, 'remove').mockImplementation(async () => {
      throw new HttpException(`User with id ${userId} not found`, 404);
    });

    try {
      await resolver.removeUser(userId);
    } catch (e) {
      expect(e.message).toEqual(`User with id ${userId} not found`);
      expect(e.status).toEqual(404);
    }
  });
});
