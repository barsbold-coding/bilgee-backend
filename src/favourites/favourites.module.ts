import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { Favourite } from '../models/favourite.model';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';
import { InternshipsModule } from '../internships/internships.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Favourite]),
    JwtModule,
    InternshipsModule,
  ],
  controllers: [FavouritesController],
  providers: [FavouritesService],
  exports: [FavouritesService],
})
export class FavouritesModule {}
