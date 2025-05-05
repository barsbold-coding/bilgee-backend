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
  Query,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { Role } from '../auth/role.enum';
import { QueryDto } from 'src/globals/dto/query.dto';
import { OrganisationFilterDto } from './dto/organisation-filter.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll(@Query() query: QueryDto) {
    return this.usersService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('organisations')
  findOrganisations(@Query() query: OrganisationFilterDto) {
    return this.usersService.findOrganisations(query);
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
  @Post(':id/approve')
  approveOrganisation(@Param('id') id: string) {
    return this.usersService.approveOrganisation(+id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
