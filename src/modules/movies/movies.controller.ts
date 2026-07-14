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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Public } from '../../common/decorators/public.decorator';
import { CreateMovieDto } from './dtos/create-movie/create-movie.dto';
import { Movie } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateMovieDto } from './dtos/update-movie/update-movie.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { UploadMoviePosterDto } from './dtos/upload-movie/upload-movie-poster.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadMoviePosterDto })
  @UseInterceptors(
    FileInterceptor('poster', {
      storage: diskStorage({
        destination: './uploads/posters',
        filename: (res, file, callback) => {
          const extName = extname(file.originalname);
          const filename = `${randomUUID()}${extName}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFile() poster: Express.Multer.File,
  ): Promise<Movie> {
    const slug = this.moviesService.createSlug(createMovieDto.originalTitle);
    return this.moviesService.create({
      slug,
      posterUrl: `/uploads/posters/${poster.filename}`,
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
