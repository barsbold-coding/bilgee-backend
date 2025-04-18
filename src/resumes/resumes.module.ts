import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { Resume } from '../models/resume.model';
import { Experience } from '../models/experience.model';
import { Education } from '../models/education.model';

@Module({
  imports: [SequelizeModule.forFeature([Resume, Experience, Education])],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
