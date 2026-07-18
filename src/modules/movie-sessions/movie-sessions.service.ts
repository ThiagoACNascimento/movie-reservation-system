import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { CreateMovieSessionDto } from './dtos/create-movie-session.dto/create-movie-session.dto';

@Injectable()
export class MovieSessionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMovieSessionDto: CreateMovieSessionDto) {
    const startAt = new Date(createMovieSessionDto.startAt);

    const [isReservedRoom, isMoviePlaying] =
      await this.prismaService.$transaction([
        this.prismaService.movieSession.findUnique({
          where: {
            roomId_startAt: {
              roomId: createMovieSessionDto.roomId,
              startAt,
            },
          },
        }),
        this.prismaService.movieSession.findUnique({
          where: {
            movieId_startAt: {
              movieId: createMovieSessionDto.movieId,
              startAt,
            },
          },
        }),
      ]);

    if (isReservedRoom) {
      throw new ConflictException('This room is aready reserved for this time');
    }

    if (isMoviePlaying) {
      throw new ConflictException(
        'This movie is aready being shown at this time',
      );
    }

    return this.prismaService.movieSession.create({
      data: {
        startAt,
        price: createMovieSessionDto.price,
        movieId: createMovieSessionDto.movieId,
        roomId: createMovieSessionDto.roomId,
      },
    });
  }
}
