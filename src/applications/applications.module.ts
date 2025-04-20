import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { InternshipsModule } from 'src/internships/internships.module';
import { Application } from 'src/models/application.model';
import { Resume } from 'src/models/resume.model';
import { ResumesModule } from 'src/resumes/resumes.module';
import { ApplicationsController } from './application.controller';
import { ApplicationsService } from './application.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Application, Resume]),
    JwtModule,
    InternshipsModule,
    ResumesModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
