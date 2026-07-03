import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The user name',
    default: 'firstNewUser',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  name!: string;

  @ApiProperty({
    description: 'The user email',
    default: 'newUser@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'The user password',
    minLength: 8,
    default: '12345678',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
