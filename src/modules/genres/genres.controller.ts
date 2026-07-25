import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GenresService } from './genres.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGenreDto } from './dtos/create-gender/create-genres.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';
import { Genre } from '../../generated/prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @Roles('admin')
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  @Public()
  getMany(
    @Query() pagination: PaginationDto,
  ): Promise<PaginationResult<Genre>> {
    return this.genresService.getMany(pagination);
  }
}
