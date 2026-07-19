import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MovieSessionsService } from './movie-sessions.service';
import { CreateMovieSessionDto } from './dtos/create-movie-session.dto/create-movie-session.dto';
import { MovieSession } from '../../generated/prisma/client';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';

@Controller('movie-sessions')
export class MovieSessionsController {
  constructor(private readonly movieSessionsService: MovieSessionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(createMovieSessionDto: CreateMovieSessionDto): Promise<MovieSession> {
    return this.movieSessionsService.create(createMovieSessionDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOneById(@Param('id') id: string): Promise<MovieSession> {
    return this.movieSessionsService.findOneById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginationResult<MovieSession>> {
    return this.movieSessionsService.findAll(pagination);
  }

  @Patch('id')
  @HttpCode(HttpStatus.OK)
  completeSession(@Param('id') id: string): Promise<void> {
    return this.movieSessionsService.completeSession(id);
  }
}
