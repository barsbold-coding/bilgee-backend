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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      ...databaseConfig,
      models: [User, Internship, Favourite, Application],
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
