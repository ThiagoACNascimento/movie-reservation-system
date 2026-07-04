import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    description: 'The user email',
    example: 'newUser@gmail.com',
  })
  email!: string;

  @ApiProperty({
    description: 'The user password',
    minLength: 8,
    example: '12345678',
  })
  @IsString()
  password!: string;
}
