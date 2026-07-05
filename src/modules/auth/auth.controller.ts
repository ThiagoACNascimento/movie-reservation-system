import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/log-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { User } from '../../generated/prisma/client';
import { type Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto): Promise<User> {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() LoginDto: LoginDto,
  ): Promise<void> {
    const accessToken = await this.authService.logIn(LoginDto);
    response.cookie('access_token', accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 15,
    });
  }
}
