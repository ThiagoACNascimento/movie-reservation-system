import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
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
import { ApiProperty } from '@nestjs/swagger';
import { MovieStatus } from '../../../../generated/prisma/enums';

export class CreateMovieDto {
  @IsString()
  @MinLength(10)
  @MaxLength(256)
  @ApiProperty({
    description: 'The Movie Title',
    example: 'Movie Title',
  })
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(256)
  @ApiProperty({
    description: 'The Movie Original Title',
    example: 'Original title',
  })
  originalTitle!: string;

  @IsEnum(MovieStatus)
  @ApiProperty({
    description: 'The Movie Status',
    enum: MovieStatus,
    example: MovieStatus.showing,
    required: false,
  })
  status?: MovieStatus;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'The Movie Release Date',
    example: '2026-07-10T12:02:00.000-04:00',
  })
  releaseDate!: Date;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  @ApiProperty({
    description: 'The Movie Score',
    example: 5,
  })
  score!: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: 'The Movie Duration',
    example: 1000 * 60 * 60 * 2,
  })
  duration!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(18)
  @ApiProperty({
    description: 'The Movie Classification',
    example: 10,
  })
  minAge!: number;

  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) =>
    Array.isArray(value) ? (value as string[]) : [value as string],
  )
  @ApiProperty({
    description: 'The Movie Gender',
    type: [String],
    example: ['Action'],
  })
  @IsString({ each: true })
  genres!: string[];

  @IsString()
  @MinLength(10)
  @MaxLength(256)
  @ApiProperty({
    description: 'The Movie Synopsis',
    example: 'The best movie ever',
  })
  synopsis!: string;
}
