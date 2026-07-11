import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from '../create-movie/create-movie.dto';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
