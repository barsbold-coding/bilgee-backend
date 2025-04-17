import { ExecutionContext, Injectable } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from './role.enum';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard extends RolesGuard {
  constructor(reflector: Reflector, jwtService: JwtService) {
    super(reflector, jwtService);
  }

  canActivate(context: ExecutionContext) {
    const canProceed = super.canActivate(context);
    if (!canProceed) return false;

    const { user } = context.switchToHttp().getRequest();
    return user.role === Role.ADMIN;
  }
}
