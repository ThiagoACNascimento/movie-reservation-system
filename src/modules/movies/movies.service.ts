import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { Movie, Prisma } from '../../generated/prisma/client';
// import { UpdateMovieDto } from './dtos/update-movie/update-movie.dto';
import { CreateMovieDto } from './dtos/create-movie/create-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createMovieDto: CreateMovieDto,
    posterFileName: string,
  ): Promise<Movie> {
    const { gender, ...rest } = createMovieDto;
    const slug = this.createSlug(createMovieDto.originalTitle);

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
          gender: {
            connect: gender.map((name) => ({ name })),
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BadRequestException(
          'This gender does not exist, try create it first!',
        );
      }

      throw error;
    }
  }

  async getBySlug(slug: string): Promise<Movie> {
    const movie = await this.prismaService.movie.findUnique({
      where: { slug },
    });

    if (!movie) {
      throw new BadRequestException();
    }

    return movie;
  }

  async getMany(): Promise<Movie[]> {
    return this.prismaService.movie.findMany();
  }

  // async update(id: string, updateDto: UpdateMovieDto): Promise<Movie> {
  //   const movieExists = await this.prismaService.movie.findUnique({
  //     where: { id },
  //   });

  //   if (!movieExists) {
  //     throw new NotFoundException('Movie not found!');
  //   }

  //   return this.prismaService.movie.update({
  //     where: { id },
  //     data: updateDto.originalTitle
  //       ? { slug: this.createSlug(updateDto.originalTitle), ...updateDto }
  //       : updateDto,
  //   });
  // }

  async remove(id: string): Promise<void> {
    const movieExists = await this.prismaService.movie.findUnique({
      where: { id },
    });

    if (!movieExists) {
      throw new NotFoundException('Movie not found!');
    }

    await this.prismaService.movie.delete({ where: { id } });
  }

  createSlug(originalTitle: string): string {
    return originalTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
