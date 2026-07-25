import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { Genre, Prisma } from '../../generated/prisma/client';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';

@Injectable()
export class GenresService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.GenreCreateInput) {
    const genre = await this.prismaService.genre.findUnique({
      where: { name: data.name },
    });

    if (genre) {
      throw new BadRequestException('Genre aready exist');
    }

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
