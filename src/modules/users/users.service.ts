import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, User } from '../../generated/prisma/browser';
import { PrismaService } from '../../infra/database/prisma.service';
import { HashingService } from '../../infra/crypt/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashingService,
  ) {}

  // TODO: SEND REAL EMAIL TO VERIFY | CHANGE LOGIC TO AUTH MODULE
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (foundUser) {
      throw new BadRequestException('Try create again');
    }

    // TODO: MOVE BCRYPT MODULE TO CRYPTOGRAPHY CLASS
    data.password = await this.hashService.hash(data.password);

    return this.prismaService.user.create({
      data,
    });
  }

  async findOne(id: string): Promise<User> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return foundUser;
  }

  findAll(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }
}
