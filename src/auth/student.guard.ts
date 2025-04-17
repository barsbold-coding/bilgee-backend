import { ExecutionContext, Injectable } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from './role.enum';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StudentGuard extends RolesGuard {
  constructor(reflector: Reflector, jwtService: JwtService) {
    super(reflector, jwtService);
  }

  canActivate(context: ExecutionContext) {
    const canProceed = super.canActivate(context);
    if (!canProceed) return false;

    const { user } = context.switchToHttp().getRequest();
    return user.role === Role.STUDENT || user.role === Role.ADMIN;
  }
}
