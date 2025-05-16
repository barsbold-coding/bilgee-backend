import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { InternshipsModule } from 'src/internships/internships.module';
import { Application } from 'src/models/application.model';
import { Internship } from 'src/models/internship.model';
import { Resume } from 'src/models/resume.model';
import { User } from 'src/models/user.model';
import { NotificationModule } from 'src/notifications/notification.module';
import { ResumesModule } from 'src/resumes/resumes.module';
import { UsersModule } from 'src/users/users.module';
import { ApplicationsController } from './application.controller';
import { ApplicationsService } from './application.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Application, Resume, User, Internship]),
    JwtModule,
    InternshipsModule,
    ResumesModule,
    NotificationModule,
    UsersModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
