import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MaxLength(10)
  @ApiProperty({
    description: 'Room name',
    example: 'Room 3',
  })
  name!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(10)
  @Max(30)
  @ApiProperty({
    description: 'Room Capacity',
    example: 30,
  })
  capacity!: number;
}
