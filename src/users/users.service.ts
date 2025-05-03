import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryDto } from 'src/globals/dto/query.dto';
import { paginate } from 'src/utils/pagination';
import { User, UserRole } from '../models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { OrganisationFilterDto } from './dto/organisation-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if phone number already exists
    const existingPhone = await this.userModel.findOne({
      where: { phoneNumber: createUserDto.phoneNumber },
    });
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    // Set verified status based on role
    const verified = createUserDto.role !== UserRole.ORGANISATION;

    return this.userModel.create({
      ...createUserDto,
      verified,
    });
  }

  async findAll(query: QueryDto) {
    return this.userModel.findAndCountAll({
      ...paginate(query),
    });
  }

  async findOne(id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.scope('authService').findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await user.update(updateUserDto);

    return this.findOne(id);
  }

  async approveOrganisation(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role !== UserRole.ORGANISATION) {
      throw new ForbiddenException('Only organisation users can be approved');
    }

    await user.update({ verified: true });
    return this.findOne(id);
  }
  async findOrganisations(query: OrganisationFilterDto) {
    const whereClause: any = { role: UserRole.ORGANISATION };

    if (query.verified !== undefined) {
      whereClause.verified = query.verified;
    }

    return this.userModel.findAndCountAll({
      where: whereClause,
      ...paginate(query),
    });
  }

  async remove(id: number): Promise<void> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await user.destroy();
  }
}
