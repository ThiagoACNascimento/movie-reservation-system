import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class GendersService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.GenderCreateInput) {
    return this.prismaService.gender.create({ data });
  }

  findAll() {
    return this.prismaService.gender.findMany();
  }
}
