import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Internship } from '../models/internship.model';
import { InternshipsController } from './internships.controller';
import { InternshipsService } from './internships.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Internship]), JwtModule],
  controllers: [InternshipsController],
  providers: [InternshipsService],
  exports: [InternshipsService],
})
export class InternshipsModule {}
