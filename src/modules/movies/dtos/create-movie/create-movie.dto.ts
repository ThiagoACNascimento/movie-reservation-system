import { Transform, Type } from 'class-transformer';
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
import { ApiProperty } from '@nestjs/swagger';

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

  @IsString()
  @MinLength(5)
  @MaxLength(50)
  @ApiProperty({
    description: 'The Movie Status',
    example: 'Published',
  })
  status!: string;

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

  @IsEnum(Classification)
  @ApiProperty({
    description: 'The Movie Classification',
    enum: Classification,
    example: Classification.L,
  })
  classification!: Classification;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value as string) ? (value as string) : ([value] as string[]),
  )
  @ApiProperty({
    description: 'The Movie Gender',
    type: [String],
    example: ['Action'],
  })
  gender!: string[];

  @IsString()
  @MinLength(10)
  @MaxLength(256)
  @ApiProperty({
    description: 'The Movie Synopsis',
    example: 'The best movie ever',
  })
  synopsis!: string;
}
