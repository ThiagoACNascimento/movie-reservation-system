import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { Movie, Prisma } from '../../generated/prisma/client';

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
}
