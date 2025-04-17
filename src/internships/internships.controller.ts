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

  // Create internship - only organizations can create
  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Post()
  create(@Body() createInternshipDto: CreateInternshipDto, @Request() req) {
    return this.internshipsService.create(createInternshipDto, req.user.id);
  }

  // Get all internships - accessible to everyone
  @Get()
  findAll(@Query() query: QueryInternshipDto) {
    return this.internshipsService.findAll(query);
  }

  // Get a specific internship - accessible to everyone
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internshipsService.findOne(+id);
  }

  // Update internship - only the organization that created it
  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateInternshipDto: UpdateInternshipDto,
    @Request() req,
  ) {
    // Admin can update any internship, organization can only update their own
    if (req.user.role === Role.ADMIN) {
      return this.internshipsService.update(+id, updateInternshipDto, null);
    }
    return this.internshipsService.update(
      +id,
      updateInternshipDto,
      req.user.id,
    );
  }

  // Delete internship - only the organization that created it
  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Admin can delete any internship, organization can only delete their own
    if (req.user.role === Role.ADMIN) {
      return this.internshipsService.remove(+id, null);
    }
    return this.internshipsService.remove(+id, req.user.id);
  }

  // Get organization's own internships
  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Get('organisation/own')
  getOwnInternships(@Request() req, @Query() query: QueryInternshipDto) {
    return this.internshipsService.getOwnInternships(req.user.id, query);
  }
}
