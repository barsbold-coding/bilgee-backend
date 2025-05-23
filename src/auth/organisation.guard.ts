import { ExecutionContext, Injectable } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from './role.enum';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from 'src/models/user.model';

@Injectable()
export class OrganisationGuard extends RolesGuard {
  constructor(reflector: Reflector, jwtService: JwtService) {
    super(reflector, jwtService);
  }

  canActivate(context: ExecutionContext) {
    const canProceed = super.canActivate(context);
    if (!canProceed) return false;

    const { user } = context.switchToHttp().getRequest();
    console.log(user);
    return (
      (user.role === Role.ORGANISATION || user.role === Role.ADMIN) &&
      user.status === UserStatus.VERIFIED
    );
  }
}
