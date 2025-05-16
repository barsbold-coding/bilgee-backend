import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryDto } from 'src/globals/dto/query.dto';
import { NotificationService } from 'src/notifications/notification.service';
import { paginate } from 'src/utils/pagination';
import { User, UserRole, UserStatus } from '../models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { OrganisationFilterDto } from './dto/organisation-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private notificationService: NotificationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingEmail = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingPhone = await this.userModel.findOne({
      where: { phoneNumber: createUserDto.phoneNumber },
    });
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    const status =
      createUserDto.role !== UserRole.ORGANISATION
        ? UserStatus.VERIFIED
        : UserStatus.PENDING;

    const user = await this.userModel.create({
      ...createUserDto,
      status,
    });

    if (createUserDto.role === UserRole.ORGANISATION) {
      await this.notificationService.notifyAdmin(
        user.id,
        createUserDto.name || createUserDto.email,
      );
    }

    return user;
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

    await user.update({ status: UserStatus.VERIFIED });
    return this.findOne(id);
  }
  async declineOrganisation(id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role !== UserRole.ORGANISATION) {
      throw new ForbiddenException('Only organisation users can be approved');
    }

    await user.update({ status: UserStatus.DECLINED });
    return this.findOne(id);
  }
  async findOrganisations(query: OrganisationFilterDto) {
    const where: any = { role: UserRole.ORGANISATION };

    if (query.status) {
      where.status = query.status;
    }

    return await this.userModel.findAndCountAll({
      where,
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
