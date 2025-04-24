import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrganisationGuard } from 'src/auth/organisation.guard';
import { Role } from 'src/auth/role.enum';
import { StudentGuard } from 'src/auth/student.guard';
import { InternshipsService } from 'src/internships/internships.service';
import { ApplicationsService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly internshipService: InternshipsService,
  ) {}

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Post()
  async create(@Body() body: CreateApplicationDto, @Request() req) {
    const internship = await this.internshipService.findOne(body.internshipId);

    if (!internship) {
      throw new ForbiddenException('Internship not found');
    }

    return this.applicationsService.create(body, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: QueryApplicationDto, @Request() req) {
    if (req.user.role === Role.ADMIN) {
      return this.applicationsService.findAll(query);
    }

    if (req.user.role === Role.STUDENT) {
      query.studentId = req.user.id;
      return this.applicationsService.findAll(query);
    }

    if (req.user.role === Role.ORGANISATION) {
      return this.applicationsService.findAllForEmployer(req.user.id, query);
    }

    throw new ForbiddenException(
      'You do not have permission to view these application',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const application = await this.applicationsService.findOne(id);

    if (req.user.role === Role.ADMIN) {
      return application;
    }

    if (
      req.user.role === Role.STUDENT &&
      application.studentId === req.user.id
    ) {
      return application;
    }

    if (req.user.role === Role.ORGANISATION) {
      const internship = await this.internshipService.findOne(
        application.internshipId,
      );
      if (internship.employerId === req.user.id) {
        return application;
      }
    }
    throw new ForbiddenException(
      'You do not have permission to view this application',
    );
  }

  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateApplicationDto,
    @Request() req,
  ) {
    const application = await this.applicationsService.findOne(id);
    const internship = await this.internshipService.findOne(
      application.internshipId,
    );

    if (req.user.role === Role.ADMIN) {
      return this.applicationsService.update(id, data);
    }

    if (internship.employerId === req.user.id) {
      return this.applicationsService.update(id, data);
    }

    throw new ForbiddenException(
      'You do not have permission to update this application',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const application = await this.applicationsService.findOne(id);

    if (req.user.role === Role.ADMIN) {
      return this.applicationsService.remove(id);
    }

    if (
      req.user.role === Role.STUDENT &&
      application.studentId === req.user.id
    ) {
      return this.applicationsService.remove(id);
    }

    if (req.user.role === Role.ORGANISATION) {
      const internship = await this.internshipService.findOne(
        application.internshipId,
      );
      if (internship.employerId === req.user.id) {
        return this.applicationsService.remove(id);
      }
    }

    throw new ForbiddenException(
      'You do not have permission to delete this application',
    );
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get('student/own')
  async getOwnApplication(@Request() req, @Query() query: QueryApplicationDto) {
    query.studentId = req.user.id;
    return this.applicationsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, OrganisationGuard)
  @Get('internship/:internshipId')
  async getApplicationForInternship(
    @Param('intershipId', ParseIntPipe) internshipId: number,
    @Request() req,
    @Query() query: QueryApplicationDto,
  ) {
    const internship = await this.internshipService.findOne(internshipId);

    if (req.user.role === Role.ADMIN) {
      query.internshipId = internshipId;
      return this.applicationsService.findAll(query);
    }

    if (internship.employerId === req.user.id) {
      query.internshipId = internshipId;
      return this.applicationsService.findAll(query);
    }

    throw new ForbiddenException(
      'You do not have permission to view applications for this internship',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/resume')
  async getApplicationResume(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const application = await this.applicationsService.findOne(id);

    // Check permissions
    if (req.user.role === Role.ADMIN) {
      return this.applicationsService.getApplicationResume(id);
    }

    if (
      req.user.role === Role.STUDENT &&
      application.studentId === req.user.id
    ) {
      return this.applicationsService.getApplicationResume(id);
    }

    if (req.user.role === Role.ORGANISATION) {
      const internship = await this.internshipService.findOne(
        application.internshipId,
      );
      if (internship.employerId === req.user.id) {
        const res = await this.applicationsService.getApplicationResume(id);
        return res;
      }
    }

    throw new ForbiddenException(
      'You do not have permission to view this application resume',
    );
  }
}
