import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import { type ConfigType } from '@nestjs/config';
import { type Request } from 'express';
import { REQUEST_USER_KEY } from '../../auth.constants';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../../common/decorators/public.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigs: ConfigType<typeof jwtConfig>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractAccessTokenFromCookies(request);

    if (!token) {
      throw new UnauthorizedException('You are not logging');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        this.jwtConfigs,
      );
      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractAccessTokenFromCookies(request: Request): string | undefined {
    const token = request.cookies?.['access_token'] as string | undefined;
    return token;
  }
}
