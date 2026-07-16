import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGenderDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(15)
  name!: string;
}
