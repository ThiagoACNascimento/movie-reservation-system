import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from '../create-movie/create-movie.dto';
import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'The movie has to have at list 1 gender' })
  @IsString({ each: true })
  gender?: string[];
}
