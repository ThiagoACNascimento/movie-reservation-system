import { PrismaService } from '@/infra/database/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { Prisma, User } from '@/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

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
}
