import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Cookies } from '../interfaces/cookie.interface';

export const Cookie = createParamDecorator(
  (field: keyof Cookies, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const cookies: Cookies | undefined = request?.cookies as Cookies;
    return field ? cookies?.[field] : cookies;
  },
);
