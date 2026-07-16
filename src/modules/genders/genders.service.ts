import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class GendersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create() {}
}
