import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Role, ROLES_KEY } from '@app/auth/roles';
import { JwtStrategy } from '@app/auth/strategies';
import { jwtConstants } from '@app/config/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        return false;
      }

      const payload = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });
      const user = await this.jwtStrategy.validate(payload);

      return requiredRoles.some((role) => user.roles?.includes(role));
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
