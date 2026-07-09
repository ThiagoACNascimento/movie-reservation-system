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
import { Cookie } from '../../common/decorators/cookie.decorator';

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
    const token = await this.authService.logIn(LoginDto);
    this.buildAuthAccessCookie(response, token.accessToken);
    this.buildAuthRefreshCookie(response, token.refreshToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @Cookie('refresh_token') refreshToken: string,
  ) {
    const tokens = await this.authService.refresh(refreshToken);
    this.buildAuthAccessCookie(response, tokens.accessToken);
    this.buildAuthRefreshCookie(response, tokens.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Cookie('refresh_token') refreshToken: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (refreshToken) {
      return this.authService.logout(refreshToken);
    }

    response.clearCookie('access_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/auth/refresh' });
  }

  // TODO: move cookie logic to a dedicate escope
  private buildAuthAccessCookie(response: Response, token: string) {
    response.cookie('access_token', token, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 15,
    });
  }

  private buildAuthRefreshCookie(response: Response, token: string) {
    response.cookie('refresh_token', token, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }
}
