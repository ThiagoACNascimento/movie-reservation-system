import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Classification } from '../../../../generated/prisma/enums';

export class CreateMovieDto {
  @IsString()
  @MinLength(10)
  @MaxLength(256)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(256)
  originalTitle!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(50)
  status!: string;

  @IsDate()
  @Type(() => Date)
  releaseDate!: Date;

  @IsNumber()
  @Max(10)
  @Min(0)
  score!: number;

  @IsInt()
  duration!: number;

  @IsEnum(Classification)
  classification!: Classification;

  @IsArray()
  gender!: string[];

  @IsString()
  @MinLength(10)
  @MaxLength(256)
  synopsis!: string;
}
