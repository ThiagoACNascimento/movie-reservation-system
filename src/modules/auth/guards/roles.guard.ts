import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../../../generated/prisma/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUserData } from '../interfaces/auth-user.interface';
import { REQUEST_USER_KEY } from '../auth.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const role = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!role) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request[REQUEST_USER_KEY] as AuthUserData | undefined;

    if (!user) {
      throw new ForbiddenException('You are not authorized to do this.');
    }

    return role.some((role) => user.role === role);
  }
}
