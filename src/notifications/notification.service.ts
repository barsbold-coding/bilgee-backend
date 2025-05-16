import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Application, ApplicationStatus } from 'src/models/application.model';
import { Notification } from 'src/models/notification.model';
import { User, UserRole, UserStatus } from 'src/models/user.model';
import { paginate } from 'src/utils/pagination';
import {
  CreateNotificationDto,
  NotificationQueryDto,
  UpdateNotificationDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification)
    private notificationModel: typeof Notification,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(userId: number, query: NotificationQueryDto) {
    const where: WhereOptions = {
      userId,
    };

    if (query.seen !== undefined) {
      where.seen = query.seen;
    }

    return this.notificationModel.findAll({
      ...paginate(query),
      where,
    });
  }

  async findAllByUserId(userId: number) {
    return this.notificationModel.findAll({
      where: { userId },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationModel.findByPk(id);

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async create(data: CreateNotificationDto) {
    return this.notificationModel.create({
      ...data,
    });
  }

  async update(id: number, data: UpdateNotificationDto) {
    const notification = await this.findOne(id);

    await notification.update(data);
    return notification;
  }

  async markAsSeen(id: number): Promise<Notification> {
    const notification = await this.findOne(id);

    await notification.update({ seenAt: new Date(), seen: true });
    return notification;
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await notification.destroy();
  }

  async notifyAdmin(organizationId: number, organizationName: string) {
    const adminUsers = await this.userModel.findAll({
      where: { role: UserRole.ADMIN },
    });

    const notificationPromises = adminUsers.map((admin) => {
      return this.create({
        userId: admin.id,
        title: 'New Organization Registration',
        description: `New organization "${organizationName}" has registered and is pending approval.`,
        type: 'ORGANIZATION_REGISTRATION',
        metadata: { organizationId },
      });
    });

    await Promise.all(notificationPromises);
  }

  async notifyOrganizationApproved(organizationId: number) {
    return this.create({
      userId: organizationId,
      title: 'Organization Approved',
      description:
        'Your organization has been approved. You can now access all features.',
      type: 'ORGANIZATION_APPROVED',
      metadata: { status: UserStatus.VERIFIED },
    });
  }

  async notifyOrganizationDeclined(organizationId: number) {
    return this.create({
      userId: organizationId,
      title: 'Organization Registration Declined',
      description:
        'Your organization registration has been declined. Please contact support for more information.',
      type: 'ORGANIZATION_DECLINED',
      metadata: { status: UserStatus.DECLINED },
    });
  }

  // Application-specific notification methods
  async notifyNewApplication(
    employerId: number,
    applicationId: number,
    internshipId: number,
    studentId: number,
    studentName: string,
    internshipTitle: string,
  ) {
    return this.create({
      userId: employerId,
      title: 'New Application Received',
      description: `${studentName} has applied for your internship: ${internshipTitle}`,
      type: 'NEW_APPLICATION',
      metadata: {
        applicationId,
        internshipId,
        studentId,
      },
    });
  }

  async notifyApplicationStatusChange(
    studentId: number,
    applicationId: number,
    internshipId: number,
    internshipTitle: string,
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
  ) {
    return this.create({
      userId: studentId,
      title: 'Application Status Updated',
      description: `Your application for "${internshipTitle}" has been updated from ${oldStatus} to ${newStatus}`,
      type: 'APPLICATION_STATUS_CHANGED',
      metadata: {
        applicationId,
        internshipId,
        oldStatus,
        newStatus,
      },
    });
  }

  async notifyApplicationAccepted(
    studentId: number,
    applicationId: number,
    internshipId: number,
    internshipTitle: string,
    employerName: string,
  ) {
    return this.create({
      userId: studentId,
      title: 'Application Accepted!',
      description: `Congratulations! Your application for "${internshipTitle}" at ${employerName} has been accepted.`,
      type: 'APPLICATION_ACCEPTED',
      metadata: {
        applicationId,
        internshipId,
      },
    });
  }

  async notifyApplicationRejected(
    studentId: number,
    applicationId: number,
    internshipId: number,
    internshipTitle: string,
    employerName: string,
  ) {
    return this.create({
      userId: studentId,
      title: 'Application Not Selected',
      description: `We regret to inform you that your application for "${internshipTitle}" at ${employerName} was not selected.`,
      type: 'APPLICATION_REJECTED',
      metadata: {
        applicationId,
        internshipId,
      },
    });
  }

  async notifyApplicationInterview(
    studentId: number,
    applicationId: number,
    internshipId: number,
    internshipTitle: string,
    employerName: string,
  ) {
    return this.create({
      userId: studentId,
      title: 'Interview Stage Reached',
      description: `Good news! Your application for "${internshipTitle}" at ${employerName} has moved to the interview stage. Watch for further communication.`,
      type: 'APPLICATION_INTERVIEW',
      metadata: {
        applicationId,
        internshipId,
      },
    });
  }

  async notifyEmployerApplicationUpdate(
    employerId: number,
    applicationId: number,
    internshipId: number,
    studentId: number,
    studentName: string,
    internshipTitle: string,
    status: ApplicationStatus,
  ) {
    let title = 'Application Status Updated';
    let description = `You have updated ${studentName}'s application for "${internshipTitle}" to ${status}`;
    let type = 'EMPLOYER_APPLICATION_UPDATE';

    if (status === ApplicationStatus.APPROVED) {
      title = 'Application Accepted Confirmation';
      description = `You have accepted ${studentName}'s application for "${internshipTitle}".`;
      type = 'EMPLOYER_APPLICATION_ACCEPTED';
    } else if (status === ApplicationStatus.REJECTED) {
      title = 'Application Rejected Confirmation';
      description = `You have rejected ${studentName}'s application for "${internshipTitle}".`;
      type = 'EMPLOYER_APPLICATION_REJECTED';
    }

    return this.create({
      userId: employerId,
      title,
      description,
      type,
      metadata: {
        applicationId,
        internshipId,
        studentId,
        status,
      },
    });
  }
}
