import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @MinLength(10)
  @MaxLength(256)
  name!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(256)
  slug!: string;

  @IsDate()
  @Type(() => Date)
  releaseDate!: Date;

  @IsNumber()
  @Max(10)
  @Min(0)
  score!: number;

  @IsInt()
  duration!: number;

  @IsString()
  @MaxLength(2)
  @MinLength(1)
  classification!: string;

  @IsArray()
  gender!: string[];

  @IsString()
  @MinLength(10)
  @MaxLength(256)
  synopsis!: string;
}
