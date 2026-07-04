import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'The user name',
    example: 'MyFirstUser',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  name!: string;

  @ApiProperty({
    description: 'The user email',
    example: 'newUser@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'The user password',
    minLength: 8,
    example: '12345678',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
