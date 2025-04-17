import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { AddFavouriteDto } from './dto/add-favourite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentGuard } from '../auth/student.guard';
import { QueryDto } from '../globals/dto/query.dto';

@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Post()
  addToFavourites(@Body() addFavouriteDto: AddFavouriteDto, @Request() req) {
    return this.favouritesService.addToFavourites(req.user.id, addFavouriteDto);
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Delete(':internshipId')
  removeFromFavourites(
    @Param('internshipId') internshipId: string,
    @Request() req,
  ) {
    return this.favouritesService.removeFromFavourites(
      req.user.id,
      +internshipId,
    );
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get()
  getFavourites(@Request() req, @Query() query: QueryDto) {
    return this.favouritesService.getFavourites(req.user.id, query);
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get('check/:internshipId')
  checkIsFavourite(
    @Param('internshipId') internshipId: string,
    @Request() req,
  ) {
    return {
      isFavourite: this.favouritesService.checkIsFavourite(
        req.user.id,
        +internshipId,
      ),
    };
  }
}
