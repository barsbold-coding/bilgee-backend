import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentGuard } from '../auth/student.guard';
import { UserRole } from '../models/user.model';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Post()
  create(@Body() createResumeDto: CreateResumeDto, @Request() req) {
    return this.resumesService.create(req.user.id, createResumeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const resume = await this.resumesService.findOne(+id);

    if (
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.ORGANISATION ||
      (req.user.role === UserRole.STUDENT && resume.studentId === req.user.id)
    ) {
      return resume;
    }

    throw new ForbiddenException('You are not authorized to view this resume');
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get('student/my-resume')
  async findMyResume(@Request() req) {
    try {
      return await this.resumesService.findByStudentId(req.user.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { exists: false };
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @Request() req,
  ) {
    const resume = await this.resumesService.findOne(+id);

    if (resume.studentId !== req.user.id) {
      throw new ForbiddenException("You cannot update someone else's resume");
    }

    return this.resumesService.update(+id, updateResumeDto);
  }
}
