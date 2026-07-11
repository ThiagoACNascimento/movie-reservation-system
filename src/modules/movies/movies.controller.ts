import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Public } from '../../common/decorators/public.decorator';
import { CreateMovieDto } from './dtos/create-movie/create-movie.dto';
import { Movie } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateMovieDto } from './dtos/update-movie/update-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // TODO: create a custom slug generation function
  @Post()
  @Roles('admin')
  async create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @Get(':slug')
  @Public()
  getOne(@Param('slug') slug: string) {
    return this.moviesService.getBySlug(slug);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateMovieDto) {
    if (Object.keys(updateDto).length === 0) {
      throw new BadRequestException(
        'You need to include at least one property! ',
      );
    }
    return this.moviesService.update(id, updateDto);
  }
}
