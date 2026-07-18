import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { Movie, Prisma } from '../../generated/prisma/client';
import { UpdateMovieDto } from './dtos/update-movie/update-movie.dto';
import { CreateMovieDto } from './dtos/create-movie/create-movie.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';
import { createSlug } from '../../common/utils/create-slug.utils';

@Injectable()
export class MoviesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createMovieDto: CreateMovieDto,
    posterFileName: string,
  ): Promise<Movie> {
    const { genres, ...rest } = createMovieDto;
    const slug = createSlug(createMovieDto.originalTitle);

    const movieExists = await this.prismaService.movie.findUnique({
      where: { slug },
    });

    if (movieExists) {
      throw new BadRequestException('The movie aready exists!');
    }

    try {
      return await this.prismaService.movie.create({
        data: {
          ...rest,
          slug,
          posterUrl: `/uploads/posters/${posterFileName}`,
          genres: {
            connect: genres.map((name) => ({ name })),
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BadRequestException(
          'This genre does not exist, try create it first!',
        );
      }

      throw error;
    }
  }

  async getBySlug(slug: string): Promise<Movie> {
    const movie = await this.prismaService.movie.findUnique({
      where: { slug },
      include: { genres: true },
    });

    if (!movie) {
      throw new BadRequestException();
    }

    return movie;
  }

  async getMany(pagination: PaginationDto): Promise<PaginationResult<Movie>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.movie.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.movie.count(),
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
        next: page < lastPage ? page + 1 : null,
      },
    };
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movieExists = await this.prismaService.movie.findUnique({
      where: { id },
    });

    if (!movieExists) {
      throw new NotFoundException('Movie not found!');
    }

    const { genres, ...rest } = updateMovieDto;

    try {
      return this.prismaService.movie.update({
        where: { id },
        data: {
          ...rest,
          ...(rest.originalTitle && {
            slug: createSlug(rest.originalTitle),
          }),
          ...(genres && {
            genres: {
              set: genres.map((name) => ({ name })),
            },
          }),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BadRequestException('This informed genre does not exist!');
      }

      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const movieExists = await this.prismaService.movie.findUnique({
      where: { id },
    });

    if (!movieExists) {
      throw new NotFoundException('Movie not found!');
    }

    await this.prismaService.movie.delete({ where: { id } });
  }
}
