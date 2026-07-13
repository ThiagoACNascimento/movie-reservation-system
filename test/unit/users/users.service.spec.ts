import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/modules/users/users.service';
import { PrismaService } from '../../../src/infra/database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UsersService;
  const prismaMock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const userInputValue = {
    name: 'New User',
    email: 'newuser@example.com',
    password: '12345678',
  };

  const userOutputValue = {
    id: '6153219f-1aca-44b8-940e-cd90922f6ed8',
    name: 'New User',
    email: 'newuser@example.com',
    role: 'default',
    createdAt: '2026-06-29T22:33:57.423Z',
    updatedAt: '2026-06-29T22:33:57.423Z',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create user (POST)', () => {
    it('should create a new user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(userOutputValue);
      const result = await userService.create(userInputValue);

      expect(result).toEqual(userOutputValue);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: userInputValue,
      });
    });

    it('should throw `BadReqeustException`', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userOutputValue);
      try {
        await userService.create(userInputValue);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);

        if (error instanceof BadRequestException) {
          expect(error.message).toEqual('Try create again');
          expect(error.getStatus()).toBe(400);
        }
      }
    });
  });
});
