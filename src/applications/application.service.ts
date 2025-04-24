import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WhereOptions } from 'sequelize';
import { Application, ApplicationStatus } from 'src/models/application.model';
import { Education } from 'src/models/education.model';
import { Experience } from 'src/models/experience.model';
import { Internship } from 'src/models/internship.model';
import { Resume } from 'src/models/resume.model';
import { User } from 'src/models/user.model';
import { ResumesService } from 'src/resumes/resumes.service';
import { paginate } from 'src/utils/pagination';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application)
    private applicationModel: typeof Application,
    private resumesService: ResumesService,
  ) {}

  async create(data: CreateApplicationDto, studentId: number) {
    const existing = await this.applicationModel.findOne({
      where: {
        studentId,
        internshipId: data.internshipId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'You have already applied for this internship',
      );
    }

    const resume = await this.resumesService.findByStudentId(studentId);

    if (!resume) {
      throw new ConflictException(
        'You need to create a resume before applying for internships',
      );
    }

    return this.applicationModel.create({
      studentId,
      internshipId: data.internshipId,
      status: ApplicationStatus.PENDING,
      appliedAt: new Date(),
    });
  }

  async findAll(query: QueryApplicationDto) {
    const where: WhereOptions = {};

    if (query.internshipId) {
      where.internshipId = query.internshipId;
    }

    if (query.studentId) {
      where.studentId = query.studentId;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.applicationModel.findAndCountAll({
      ...paginate(query),
      where,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phoneNumber'],
        },
        {
          model: Internship,
          as: 'internship',
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

  async findAllForEmployer(employerId: number, query: QueryApplicationDto) {
    const where: WhereOptions = {};

    if (query.internshipId) {
      where.internshipId = query.internshipId;
    }
    if (query.status) {
      where.status = query.status;
    }

    return this.applicationModel.findAndCountAll({
      ...paginate(query),
      where,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phoneNumber'],
          // include: [
          //   {
          //     model: Resume,
          //     include: [Experience, Education],
          //   },
          // ],
        },
        {
          model: Internship,
          as: 'internship',
          where: { employerId },
          // include: [
          //   {
          //     model: User,
          //     as: 'employer',
          //     attributes: ['id', 'name', 'email'],
          //   },
          // ],
        },
      ],
    });
  }

  async findOne(id: number) {
    const application = await this.applicationModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phoneNumber'],
          include: [
            {
              model: Resume,
              include: [Experience, Education],
            },
          ],
        },
        {
          model: Internship,
          as: 'internship',
          // include: [
          //   {
          //     model: User,
          //     as: 'employer',
          //     attributes: ['id', 'name', 'email'],
          //   },
          // ],
        },
      ],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async update(id: number, data: UpdateApplicationDto) {
    const application = await this.applicationModel.findByPk(id);

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    await application.update(data);

    return this.findOne(id);
  }

  async remove(id: number) {
    const application = await this.applicationModel.findByPk(id);

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    await application.destroy();
  }

  async getApplicationResume(id: number) {
    const app = await this.applicationModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phoneNumber'],
        },
      ],
    });

    if (!app) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const resume = await this.resumesService.findByStudentId(app.studentId);

    if (!resume) {
      throw new NotFoundException(
        `Resume for application with ID ${id} not found`,
      );
    }

    return resume;
  }
}
