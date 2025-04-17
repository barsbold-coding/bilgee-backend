// src/users/users.controller.ts
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { StudentGuard } from '../auth/student.guard';
import { OrganisationGuard } from '../auth/organisation.guard';
import { Role } from '../auth/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // Allow only admins or the user themselves to update
    if (req.user.role === Role.ADMIN || req.user.id === +id) {
      return this.usersService.update(+id, updateUserDto);
    }
    throw new UnauthorizedException(
      'You are not authorized to update this user',
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // Role-specific endpoints examples
  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get('student/dashboard')
  getStudentDashboard() {
    return { message: 'Student dashboard' };
  }

  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Get('organisation/dashboard')
  getOrganisationDashboard() {
    return { message: 'Organisation dashboard' };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/dashboard')
  getAdminDashboard() {
    return { message: 'Admin dashboard' };
  }
}
