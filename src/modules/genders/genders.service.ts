import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { Genre, Prisma } from '../../generated/prisma/client';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';

@Injectable()
export class GendersService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.GenreCreateInput) {
    return this.prismaService.genre.create({ data });
  }

  async getMany(pagination: PaginationDto): Promise<PaginationResult<Genre>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.genre.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prismaService.genre.count(),
    ]);

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage,
        prev: page > 1 ? page - 1 : null,
        next: page < 1 ? page + 1 : null,
      },
    };
  }
}
