import { PrismaService } from '@/infra/database/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { Prisma, User } from '@/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  // TODO: SEND REAL EMAIL TO VERIFY | HASH PASSWORD |
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (foundUser) {
      throw new BadRequestException('Try create again');
    }

    console.log(data);
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
