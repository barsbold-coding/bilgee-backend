import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './models/user.model';
import { Internship } from './models/internship.model';
import { Favourite } from './models/favourite.model';
import { Application } from './models/application.model';
import { InternshipsModule } from './internships/internships.module';
import { FavouritesModule } from './favourites/favourites.module';
import { ResumesModule } from './resumes/resumes.module';
import { ApplicationsModule } from './applications/applications.module';
import { Resume } from './models/resume.model';
import { Education } from './models/education.model';
import { Experience } from './models/experience.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      ...databaseConfig,
      models: [
        User,
        Internship,
        Favourite,
        Application,
        Resume,
        Education,
        Experience,
      ],
    }),
    AuthModule,
    UsersModule,
    InternshipsModule,
    FavouritesModule,
    ResumesModule,
    ApplicationsModule,
  ],
})
export class AppModule {}
