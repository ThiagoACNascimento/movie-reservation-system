import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { Movie, Prisma } from '../../generated/prisma/client';
import { UpdateMovieDto } from './dtos/update-movie/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.MovieCreateInput): Promise<Movie> {
    const movieExists = await this.prismaService.movie.findUnique({
      where: { slug: data.slug },
    });

    if (movieExists) {
      throw new BadRequestException('The movie aready exists!');
    }

    return this.prismaService.movie.create({ data });
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

  async update(id: string, updateDto: UpdateMovieDto): Promise<Movie> {
    const movieExists = await this.prismaService.movie.findUnique({
      where: { id },
    });

    if (!movieExists) {
      throw new NotFoundException('Movie not found!');
    }

    return this.prismaService.movie.update({
      where: { id },
      data: updateDto,
    });
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
