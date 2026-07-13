import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    const slug = this.moviesService.createSlug(createMovieDto.title);
    return this.moviesService.create({
      slug,
      ...createMovieDto,
    });
  }

  @Get(':slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  getOne(@Param('slug') slug: string) {
    return this.moviesService.getBySlug(slug);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  getMany(): Promise<Movie[]> {
    return this.moviesService.getMany();
  }

  @Patch(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMovieDto,
  ): Promise<Movie> {
    if (Object.keys(updateDto).length === 0) {
      throw new BadRequestException(
        'You need to include at least one property! ',
      );
    }
    return this.moviesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.moviesService.remove(id);
  }
}
