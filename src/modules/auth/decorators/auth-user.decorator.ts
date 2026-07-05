import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../auth.constants';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthUserData } from '../interfaces/auth-user.interface';

export const AuthUser = createParamDecorator(
  (field: keyof AuthUserData | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const user: AuthUserData | undefined = request[
      REQUEST_USER_KEY
    ] as JwtPayload;
    return field ? user?.[field] : user;
  },
);
