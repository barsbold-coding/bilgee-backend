import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Internship, InternshipStatus } from '../models/internship.model';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { paginate } from 'src/utils/pagination';
import { QueryInternshipDto } from './dto/query-internship.dto';
import { Op, Sequelize } from 'sequelize';
import { User } from 'src/models/user.model';
import { Application } from 'src/models/application.model';

@Injectable()
export class InternshipsService {
  constructor(
    @InjectModel(Internship)
    private internshipModel: typeof Internship,
  ) {}

  async create(
    createInternshipDto: CreateInternshipDto,
    employerId: number,
  ): Promise<Internship> {
    return this.internshipModel.create({
      ...createInternshipDto,
      employerId,
    });
  }

  async findAll(query: QueryInternshipDto) {
    const where: any = {};

    if (query.title) {
      where.title = {
        [Op.iLike]: `%${query.title}%`,
      };
    }
    if (query.location) {
      where.location = {
        [Op.iLike]: `%${query.location}%`,
      };
    }
    if (query.employerId) {
      where.employerId = query.employerId;
    }
    if (query.internshipId) {
      console.log(query.internshipId);
      where.internshipId = query.internshipId;
    }

    // By default, only show active internships
    where.status = InternshipStatus.ACTIVE;

    return this.internshipModel.findAndCountAll({
      ...paginate(query),
      where,
      attributes: {
        include: [
          [
            Sequelize.fn('COUNT', Sequelize.col('applications.id')),
            'applicationCount',
          ],
        ],
      },
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Application,
          as: 'applications',
          attributes: [],
        },
      ],
      group: ['Internship.id', 'employer.id'],
      subQuery: false,
    });
  }

  async findOne(id: number) {
    const internship = await this.internshipModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!internship) {
      throw new NotFoundException(`Internship with ID ${id} not found`);
    }

    return internship;
  }

  async update(
    id: number,
    updateInternshipDto: UpdateInternshipDto,
    employerId: number,
  ): Promise<Internship> {
    const internship = await this.internshipModel.findOne({
      where: {
        id,
        employerId,
      },
    });

    if (!internship) {
      throw new NotFoundException(
        `Internship with ID ${id} not found or you don't have permission to update it`,
      );
    }

    await internship.update(updateInternshipDto);

    return this.findOne(id);
  }

  async remove(id: number, employerId: number): Promise<void> {
    const internship = await this.internshipModel.findOne({
      where: {
        id,
        employerId,
      },
    });

    if (!internship) {
      throw new NotFoundException(
        `Internship with ID ${id} not found or you don't have permission to delete it`,
      );
    }

    await internship.destroy();
  }

  async getOwnInternships(employerId: number, query: QueryInternshipDto) {
    query.employerId = employerId;
    return this.findAll(query);
  }
}
