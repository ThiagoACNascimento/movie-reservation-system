import { Body, Controller, Get, Post } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Public } from '../../common/decorators/public.decorator';
import { CreateMovieDto } from './dtos/create-movie/create-movie.dto';
import { Movie } from '../../generated/prisma/client';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Public()
  async create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  @Public()
  getOne() {
    return [];
  }
}
