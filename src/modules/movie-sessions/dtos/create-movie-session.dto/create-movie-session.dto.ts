import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateMovieSessionDto {
  @IsDateString()
  @ApiProperty({
    description: 'When Movie Session Start',
    example: '2030-07-18T16:37:00Z',
  })
  startAt!: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @ApiProperty({
    description: 'Session price',
    example: 25.22,
  })
  price!: number;

  @IsUUID()
  @ApiProperty({
    description: 'Movie Id',
  })
  movieId!: string;

  @IsUUID()
  @ApiProperty({
    description: 'Room id',
  })
  roomId!: string;
}
