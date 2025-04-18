import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganisationGuard } from '../auth/organisation.guard';
import { Role } from '../auth/role.enum';
import { QueryInternshipDto } from './dto/query-internship.dto';

@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Post()
  create(@Body() createInternshipDto: CreateInternshipDto, @Request() req) {
    return this.internshipsService.create(createInternshipDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: QueryInternshipDto) {
    return this.internshipsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internshipsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateInternshipDto: UpdateInternshipDto,
    @Request() req,
  ) {
    if (req.user.role === Role.ADMIN) {
      return this.internshipsService.update(+id, updateInternshipDto, null);
    }
    return this.internshipsService.update(
      +id,
      updateInternshipDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    if (req.user.role === Role.ADMIN) {
      return this.internshipsService.remove(+id, null);
    }
    return this.internshipsService.remove(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Get('organisation/own')
  getOwnInternships(@Request() req, @Query() query: QueryInternshipDto) {
    return this.internshipsService.getOwnInternships(req.user.id, query);
  }
}
