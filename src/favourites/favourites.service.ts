import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Favourite } from '../models/favourite.model';
import { AddFavouriteDto } from './dto/add-favourite.dto';
import { QueryDto } from '../globals/dto/query.dto';
import { paginate } from '../utils/pagination';
import { Internship, InternshipStatus } from '../models/internship.model';
import { User } from '../models/user.model';
import { InternshipsService } from '../internships/internships.service';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectModel(Favourite)
    private favouriteModel: typeof Favourite,
    private internshipsService: InternshipsService,
  ) {}

  async addToFavourites(
    userId: number,
    addFavouriteDto: AddFavouriteDto,
  ): Promise<Favourite> {
    // Check if internship exists
    await this.internshipsService.findOne(addFavouriteDto.internshipId);

    // Check if already in favourites
    const existingFavourite = await this.favouriteModel.findOne({
      where: {
        userId,
        internshipId: addFavouriteDto.internshipId,
      },
    });

    if (existingFavourite) {
      throw new ConflictException(
        'This internship is already in your favourites',
      );
    }

    // Add to favourites
    return this.favouriteModel.create({
      userId,
      internshipId: addFavouriteDto.internshipId,
    });
  }

  async removeFromFavourites(userId: number, internshipId: number) {
    const favourite = await this.favouriteModel.findOne({
      where: {
        userId,
        internshipId,
      },
    });

    if (!favourite) {
      throw new NotFoundException('Favourite not found');
    }

    await favourite.destroy();
  }

  async getFavourites(userId: number, query: QueryDto) {
    return this.favouriteModel.findAndCountAll({
      where: {
        userId,
      },
      ...paginate(query),
      include: [
        {
          model: Internship,
          where: {
            status: InternshipStatus.ACTIVE,
          },
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });
  }

  async checkIsFavourite(userId: number, internshipId: number) {
    const favourite = await this.favouriteModel.findOne({
      where: {
        userId,
        internshipId,
      },
    });

    return !!favourite;
  }
}
