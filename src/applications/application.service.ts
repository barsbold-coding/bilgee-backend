import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WhereOptions } from 'sequelize';
import { InternshipsService } from 'src/internships/internships.service';
import { Application, ApplicationStatus } from 'src/models/application.model';
import { Education } from 'src/models/education.model';
import { Experience } from 'src/models/experience.model';
import { Internship } from 'src/models/internship.model';
import { Resume } from 'src/models/resume.model';
import { User } from 'src/models/user.model';
import { NotificationService } from 'src/notifications/notification.service';
import { ResumesService } from 'src/resumes/resumes.service';
import { UsersService } from 'src/users/users.service';
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
    private notificationService: NotificationService,
    private internshipService: InternshipsService,
    private userService: UsersService,
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

    // Get the internship with employer information to send notification
    const internship = await this.internshipService.findOne(data.internshipId);

    if (!internship) {
      throw new NotFoundException('Internship not found');
    }

    // Get student information for the notification
    const student = await this.userService.findOne(studentId);

    const application = await this.applicationModel.create({
      studentId,
      internshipId: data.internshipId,
      status: ApplicationStatus.PENDING,
      appliedAt: new Date(),
    });

    // Notify employer about new application
    await this.notificationService.create({
      userId: internship.employerId,
      title: 'New Application Received',
      description: `${student.name} has applied for your internship: ${internship.title}`,
      type: 'NEW_APPLICATION',
      metadata: {
        applicationId: application.id,
        internshipId: data.internshipId,
        studentId: studentId,
      },
    });

    return application;
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
        },
        {
          model: Internship,
          as: 'internship',
          where: { employerId },
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
        },
      ],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async update(id: number, data: UpdateApplicationDto) {
    const application = await this.applicationModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Internship,
          as: 'internship',
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // Store previous status to compare
    const previousStatus = application.status;

    await application.update(data);

    // Send notification about status change if status has changed
    if (data.status && data.status !== previousStatus) {
      await this.sendStatusChangeNotifications(application, previousStatus);
    }

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

  private async sendStatusChangeNotifications(
    application: Application,
    previousStatus: ApplicationStatus,
  ) {
    // Send notification to student about application status change
    await this.notificationService.create({
      userId: application.studentId,
      title: 'Application Status Updated',
      description: `Your application for "${application.internship.title}" has been updated from ${previousStatus} to ${application.status}`,
      type: 'APPLICATION_STATUS_CHANGED',
      metadata: {
        applicationId: application.id,
        internshipId: application.internshipId,
        oldStatus: previousStatus,
        newStatus: application.status,
      },
    });

    // Create custom messages based on status
    if (application.status === ApplicationStatus.APPROVED) {
      await this.notificationService.create({
        userId: application.studentId,
        title: 'Application Accepted!',
        description: `Congratulations! Your application for "${application.internship.title}" at ${application.internship.employer.name} has been accepted.`,
        type: 'APPLICATION_ACCEPTED',
        metadata: {
          applicationId: application.id,
          internshipId: application.internshipId,
        },
      });
      await this.notificationService.create({
        userId: application.internship.employerId,
        title: 'Application Accepted Confirmation',
        description: `You have accepted ${application.student.name}'s application for "${application.internship.title}".`,
        type: 'EMPLOYER_APPLICATION_ACCEPTED',
        metadata: {
          applicationId: application.id,
          internshipId: application.internshipId,
          studentId: application.studentId,
        },
      });
    } else if (application.status === ApplicationStatus.REJECTED) {
      await this.notificationService.create({
        userId: application.studentId,
        title: 'Application Not Selected',
        description: `We regret to inform you that your application for "${application.internship.title}" at ${application.internship.employer.name} was not selected.`,
        type: 'APPLICATION_REJECTED',
        metadata: {
          applicationId: application.id,
          internshipId: application.internshipId,
        },
      });
    }
  }
}
