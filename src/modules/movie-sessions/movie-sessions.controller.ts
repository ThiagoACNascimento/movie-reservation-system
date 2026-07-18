import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MovieSessionsService } from './movie-sessions.service';
import { CreateMovieSessionDto } from './dtos/create-movie-session.dto/create-movie-session.dto';

@Controller('movie-sessions')
export class MovieSessionsController {
  constructor(private readonly movieSessionsService: MovieSessionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(createMovieSessionDto: CreateMovieSessionDto) {
    return this.movieSessionsService.create(createMovieSessionDto);
  }
}
